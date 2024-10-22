import { Operations } from "@/libs/enums/common";
import { ApiRequest, ApiResponse, IHandler } from "@/libs/types/common";
import { OtpApiHandlerRequest, OtpHandlerActions } from "./types";
import { SmsClient } from "@/libs/services/sms/service";
import { BadRequestExecption } from "@/libs/error/error";
import { HTTP_RESOURCES } from "@/libs/constants/resources";

export class OtpApiHandler implements IHandler {
    operation: Operations;
    isIdempotent: boolean;
    operationId: string;
    resource: string;
    validations: any[];
    smsClient: SmsClient
    constructor() {
        this.operation = Operations.CREATE;
        this.isIdempotent = false;
        this.operationId = "otp";
        this.resource = HTTP_RESOURCES.OTP;
        this.validations = [];
        this.smsClient = new SmsClient();
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
                        to: phoneNumber
                    })
                    return res.status(200).send(result);
                }

                case OtpHandlerActions.VERIFY_OTP: {
                    const code = req.body.code;
                    if (!code) {
                        throw new BadRequestExecption("Otp Code is required for verification");
                    }
                    const result = await this.smsClient.verifyOtp({
                        code,
                        phoneNumber,
                        generateToken: true
                    })
                    return res.status(200).send(result);
                }

                default:
                    throw new BadRequestExecption("Invalid action");
            }
        } catch (error) {
            next(error)
        }
    }
}

