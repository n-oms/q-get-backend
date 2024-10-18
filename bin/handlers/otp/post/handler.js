"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpApiHandler = void 0;
const common_1 = require("../../../libs/enums/common");
const types_1 = require("./types");
const service_1 = require("../../../libs/services/sms/service");
const error_1 = require("../../../libs/error/error");
const resources_1 = require("../../../libs/constants/resources");
class OtpApiHandler {
    constructor() {
        this.operation = common_1.Operations.CREATE;
        this.isIdempotent = false;
        this.operationId = "otp";
        this.resource = resources_1.HTTP_RESOURCES.OTP;
        this.validations = [];
        this.smsClient = new service_1.SmsClient();
        this.handler = this.handler.bind(this);
    }
    handler(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const action = req.body.action;
            const phoneNumber = req.body.phoneNumber;
            try {
                if (!action) {
                    throw new error_1.BadRequestExecption("Action is required");
                }
                if (!phoneNumber) {
                    throw new error_1.BadRequestExecption("Phone number is required");
                }
                switch (action) {
                    case types_1.OtpHandlerActions.SEND_OTP: {
                        const result = yield this.smsClient.initOtpVerification({
                            to: phoneNumber
                        });
                        return res.status(200).send(result);
                    }
                    case types_1.OtpHandlerActions.VERIFY_OTP: {
                        const code = req.body.code;
                        if (!code) {
                            throw new error_1.BadRequestExecption("Otp Code is required for verification");
                        }
                        const result = yield this.smsClient.verifyOtp({
                            code,
                            phoneNumber
                        });
                        return res.status(200).send(result);
                    }
                    default:
                        throw new error_1.BadRequestExecption("Invalid action");
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.OtpApiHandler = OtpApiHandler;
