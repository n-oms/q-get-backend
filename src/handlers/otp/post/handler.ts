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
  IHandler
} from "@/libs/types/common";
import { OtpApiHandlerRequest, OtpHandlerActions } from "./types";
import { otpPostApiSchema } from "./validation";

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
          let user = await this.userService.getUserByPhoneNumber({
            phoneNumber,
          });

          // Need to extract deviceType from request
          if ( !body.deviceType) {
            throw new BadRequestExecption("Device Type not found");
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

          const result = await this.smsClient.verifyOtp({
            code,
            phoneNumber,
            generateToken: true,
          });

          if (result.status === OTP_RESPONSE_CODES.INVALID_OTP_CODE) {
            throw new BadRequestExecption("Invalid OTP code");
          }

          if(body.deviceType === DeviceType.Web && body.isNewUser){
             await this.userService.createCustomerUser({
              phoneNumber,
              name: body.name,
              scannedVendorId: body.scannedVendorId,
            })
          }
          
          const orgInfo = await this.organizationService.getOrganizationInfo();
          result.wsUrl = orgInfo.wsUrl;
          return res.status(200).send(result);
        }

        default:
          throw new BadRequestExecption("Invalid action");
      }
    } catch (error) {
      next(error);
    }
  }
}
