import { Operations } from "@/libs/enums/common";
import { ApiRequest, ApiResponse, IHandler } from "@/libs/types/common";
import { OtpApiHandlerRequest, OtpHandlerActions } from "./types";
import { SmsClient } from "@/libs/services/sms/service";
import { BadRequestExecption } from "@/libs/error/error";
import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { OTP_RESPONSE_CODES } from "@/libs/services/sms/utils";
import { OrganizationService } from "@/libs/services/organization/service";

export class OtpApiHandler implements IHandler {
  operation: Operations;
  isIdempotent: boolean;
  operationId: string;
  resource: string;
  validations: any[];
  smsClient: SmsClient;
  isAuthorizedAccess?: boolean;
  constructor() {
    this.operation = Operations.CREATE;
    this.isIdempotent = false;
    this.operationId = "otp";
    this.resource = HTTP_RESOURCES.OTP;
    this.validations = [];
    this.smsClient = new SmsClient();
    this.isAuthorizedAccess = false;
    this.handler = this.handler.bind(this);
  }

  async handler(req: ApiRequest<OtpApiHandlerRequest>, res: ApiResponse, next) {
    const action = req.body.action;
    const phoneNumber = req.body.phoneNumber;
    try {
      if (!action) {
        throw new BadRequestExecption("Action is required");
      }

      if (!phoneNumber) {
        throw new BadRequestExecption("Phone number is required");
      }

      switch (action) {
        case OtpHandlerActions.SEND_OTP: {
          const result = await this.smsClient.initOtpVerification({
            to: phoneNumber,
          });
          return res.status(200).send(result);
        }

        case OtpHandlerActions.VERIFY_OTP: {
          const code = req.body.code;
          if (!code) {
            throw new BadRequestExecption(
              "Otp Code is required for verification"
            );
          }
          const result = await this.smsClient.verifyOtp({
            code,
            phoneNumber,
            generateToken: true,
          });
          if (result.status === OTP_RESPONSE_CODES.INVALID_OTP_CODE) {
            throw new BadRequestExecption("Invalid OTP code");
          }
          const orgInfo = new OrganizationService().getOrganizationInfo();
          result.wsUrl = (await orgInfo).wsUrl;
          console.log("OTP VERIFIED DATA :", result);
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
