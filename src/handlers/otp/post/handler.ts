import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { Operations } from "@/libs/enums/common";
import { BadRequestExecption } from "@/libs/error/error";
import { OrganizationService } from "@/libs/services/organization/service";
import { SmsClient } from "@/libs/services/sms/service";
import { OTP_RESPONSE_CODES } from "@/libs/services/sms/utils";
import { UserService } from "@/libs/services/user/service";
import {
  ApiRequest,
  ApiResponse,
  DeviceType,
  IHandler,
} from "@/libs/types/common";
import { OtpApiHandlerRequest, OtpHandlerActions } from "./types";
import { otpPostApiSchema } from "./validation";
import { Scans } from "@/libs/services/mongo/models";
import { UserType } from "@/libs/services/mongo/enums";
import {
  GOOGLE_PLAY_TEST_AUTH_NUMBER,
  GOOGLE_PLAY_TEST_AUTH_OTP,
  GooglePlayService,
} from "@/libs/services/google-play/service";

export class OtpApiHandler implements IHandler {
  operation: Operations;
  isIdempotent: boolean;
  operationId: string;
  resource: string;
  validations: any[];
  smsClient: SmsClient;
  isAuthorizedAccess?: boolean;
  private readonly userService: UserService;
  private readonly organizationService: OrganizationService;
  private readonly googlePlayService: GooglePlayService;
  constructor() {
    this.operation = Operations.CREATE;
    this.isIdempotent = false;
    this.operationId = "otp";
    this.resource = HTTP_RESOURCES.OTP;
    this.validations = [];
    this.smsClient = new SmsClient();
    this.isAuthorizedAccess = false;
    this.handler = this.handler.bind(this);
    this.userService = new UserService();
    this.organizationService = new OrganizationService();
    this.googlePlayService = new GooglePlayService();
  }

  async handler(req: ApiRequest<OtpApiHandlerRequest>, res: ApiResponse, next) {
    try {
      const body = otpPostApiSchema.parse(req.body);
      const action = body.action;
      const phoneNumber = body.phoneNumber;

      if (!action) {
        throw new BadRequestExecption("Action is required");
      }

      if (!phoneNumber) {
        throw new BadRequestExecption("Phone number is required");
      }

      switch (action) {
        case OtpHandlerActions.SEND_OTP: {
          if (phoneNumber === GOOGLE_PLAY_TEST_AUTH_NUMBER) {
            return res.status(200).send({
              smsResponse: { status: "success" },
              isExisting: true,
              user:await this.googlePlayService.getTestAccountDetails(),
            });
          }

          let user = await this.userService.getUserByPhoneNumber({
            phoneNumber,
          });

          // Need to extract deviceType from request
          if (
            (!user || user.userType !== UserType.Vendor) &&
            !body.deviceType
          ) {
            throw new BadRequestExecption("User not found");
          }

          const result = await this.smsClient.initOtpVerification({
            to: phoneNumber,
          });

          return res.status(200).send({
            smsResponse: result,
            isExisting: !!user,
            user,
          });
        }

        case OtpHandlerActions.VERIFY_OTP: {
          const code = body.code;

          if (
            body.phoneNumber === GOOGLE_PLAY_TEST_AUTH_NUMBER &&
            code === GOOGLE_PLAY_TEST_AUTH_OTP
          ) {
            const testAccountDetails =
              await this.googlePlayService.getTestAccountDetails();
            return res.status(200).send(testAccountDetails);
          }

          const result = await this.smsClient.verifyOtp({
            code,
            phoneNumber,
            generateToken: true,
          });

          if (result.status === OTP_RESPONSE_CODES.INVALID_OTP_CODE) {
            throw new BadRequestExecption("Invalid OTP code");
          }

          if (
            body.isNewUser &&
            !result.user &&
            body.deviceType === DeviceType.Web
          ) {
            result.user = await this.userService.createCustomerUser({
              phoneNumber,
              name: body.name,
              scannedVendorId: body.scannedVendorId,
            });
          }

          const orgInfo = await this.organizationService.getOrganizationInfo();
          result.wsUrl = orgInfo.wsUrl;

          await this.postProcessOtpVerification({
            scannedVendorId: body.scannedVendorId,
            phoneNumber,
            name: body.name,
          });

          return res.status(200).send(result);
        }

        default:
          throw new BadRequestExecption("Invalid action");
      }
    } catch (error) {
      next(error);
    }
  }

  async postProcessOtpVerification({
    name,
    phoneNumber,
    scannedVendorId,
  }: {
    phoneNumber: string;
    scannedVendorId: string;
    name: string;
  }) {
    if (scannedVendorId) {
      await Scans.create({
        phoneNumber,
        vendorId: scannedVendorId,
        name,
        userId: phoneNumber,
      });
    }
  }
}
