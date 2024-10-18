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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsClient = void 0;
const crypto_1 = __importDefault(require("crypto"));
const utils_1 = require("./utils");
const templates_1 = require("./templates");
const types_1 = require("./types");
const env_1 = require("../../../env/env");
const service_1 = require("../otp/service");
const service_2 = require("../user/service");
class SmsClient {
    constructor() {
        this.apiKey = env_1.env.SMS_API_KEY;
        this.apiUrl = env_1.env.SMS_API_URL;
        this.otpDbClient = new service_1.OtpDBService();
        this.sendWelcomeMessage = this.sendWelcomeMessage.bind(this);
        this.createMessageUrl = this.createMessageUrl.bind(this);
        this.sendOtp = this.sendOtp.bind(this);
        this.getOtpTemplate = this.getOtpTemplate.bind(this);
        this.generateOtp = this.generateOtp.bind(this);
        this.initOtpVerification = this.initOtpVerification.bind(this);
        this.verifyOtp = this.verifyOtp.bind(this);
        this.send = this.send.bind(this);
        this.userService = new service_2.UserService();
    }
    send(input) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetch(input);
        });
    }
    static getClient() {
        if (!SmsClient.client) {
            SmsClient.client = new SmsClient();
        }
        return SmsClient.client;
    }
    sendWelcomeMessage(_a) {
        return __awaiter(this, arguments, void 0, function* ({ to }) {
            const template = templates_1.templates.welcomeMessage;
            const templateId = env_1.env.SMS_WELCOME_TEMPLATE_ID;
            const url = this.createMessageUrl({
                to,
                message: template,
                messageType: types_1.MessageType.WelcomeMessage,
                templateId,
            });
            return yield this.send(url);
        });
    }
    // Need to remove message type from here
    createMessageUrl(input) {
        const { message, templateId, to } = input;
        const encodedMessage = encodeURIComponent(message);
        const url = `${this.apiUrl}?channel=2.1&recipient=${to}&contentType=3.1&dr=false&msg=${encodedMessage}&user=${env_1.env.SMS_TATA_TEL_USERNAME}&pswd=${env_1.env.SMS_TATA_TEL_PASSWORD}&sender=${env_1.env.SMS_SENDER_ID}&PE_ID=${env_1.env.SMS_TATA_TEL_PE_ID}&Template_ID=${templateId}`;
        return url;
    }
    initOtpVerification(input) {
        return __awaiter(this, void 0, void 0, function* () {
            // Connecting to the Mongo DB
            // Getting existing otp entry from the database
            const otpEntry = yield this.otpDbClient.getOtpEntry(input.to);
            if (!otpEntry) {
                // Create a new entry in the database
                const code = this.generateOtp(6);
                const otpObject = {
                    phoneNumber: input.to,
                    code,
                };
                const otpResponse = yield this.sendOtp({
                    to: otpObject.phoneNumber,
                    code: otpObject.code,
                });
                if (otpResponse) {
                    const newOtpEntry = yield this.otpDbClient.createOtpEntry({
                        phoneNumber: input.to,
                        code,
                    });
                    return {
                        status: utils_1.OTP_RESPONSE_CODES.OTP_SENT,
                        data: newOtpEntry,
                        isNewEntry: true,
                    };
                }
            }
            const userInfo = yield this.userService.getUserByPhoneNumber({
                phoneNumber: input.to
            });
            if (!(otpEntry === null || otpEntry === void 0 ? void 0 : otpEntry.verified) && (otpEntry === null || otpEntry === void 0 ? void 0 : otpEntry.code)) {
                const newOtpResponse = yield this.sendOtp({
                    to: input === null || input === void 0 ? void 0 : input.to,
                    code: otpEntry === null || otpEntry === void 0 ? void 0 : otpEntry.code,
                });
                if (newOtpResponse) {
                    const updatedOtpEntry = yield this.otpDbClient.updateOtpEntry({
                        phoneNumber: input.to,
                        code: otpEntry.code,
                        lastSentAt: Date.now(),
                        verified: false,
                    });
                    return {
                        status: utils_1.OTP_RESPONSE_CODES.OTP_SENT,
                        data: updatedOtpEntry,
                        isNewEntry: false,
                        userInfo
                    };
                }
            }
            // For existing entry and verified otp, sending new otp.
            const code = this.generateOtp(6);
            const otpResponse = yield this.sendOtp({
                to: input === null || input === void 0 ? void 0 : input.to,
                code,
            });
            if (otpResponse) {
                const updatedOtpEntry = yield this.otpDbClient.updateOtpEntry({
                    phoneNumber: input.to,
                    code,
                    lastSentAt: Date.now(),
                    verified: false,
                });
                return {
                    status: utils_1.OTP_RESPONSE_CODES.OTP_SENT,
                    data: updatedOtpEntry,
                    isNewEntry: false,
                    userInfo
                };
            }
            return { status: utils_1.OTP_RESPONSE_CODES.OTP_ALREADY_VERIFIED, data: otpEntry };
        });
    }
    verifyOtp(_a) {
        return __awaiter(this, arguments, void 0, function* ({ phoneNumber, code }) {
            const otpEntry = yield this.otpDbClient.getOtpEntry(phoneNumber);
            if (!otpEntry) {
                return { status: utils_1.OTP_RESPONSE_CODES.OTP_NOT_FOUND };
            }
            // Need to implement this for rate limiting
            // if (SmsUtils.isOtpExpired(otpEntry.lastSentAt)) {
            //   return { status: OTP_RESPONSE_CODES.OTP_EXPIRED }
            // }
            if (otpEntry.verified) {
                return { status: utils_1.OTP_RESPONSE_CODES.OTP_ALREADY_VERIFIED };
            }
            const isValid = otpEntry.code === code;
            if (!isValid) {
                return { status: utils_1.OTP_RESPONSE_CODES.INVALID_OTP_CODE };
            }
            yield this.otpDbClient.updateOtpEntry({ phoneNumber, verified: true });
            return { status: utils_1.OTP_RESPONSE_CODES.OTP_VERIFIED, isValid };
        });
    }
    sendOtp(_a) {
        return __awaiter(this, arguments, void 0, function* ({ to, code }) {
            const template = this.getOtpTemplate(code);
            const templateId = env_1.env.SMS_OTP_TEMPLATE_ID;
            console.log(to, code, template, templateId);
            const url = this.createMessageUrl({
                to,
                message: template,
                messageType: types_1.MessageType.Otp,
                templateId,
            });
            console.log(url);
            try {
                const res = yield this.send(url);
                if (!res.ok) {
                    throw new Error("Failed to send OTP");
                }
                return yield res.json();
            }
            catch (error) {
                console.error(error);
                throw error;
            }
        });
    }
    getOtpTemplate(code) {
        return templates_1.templates.otp.replace("{{code}}", code);
    }
    generateOtp(length) {
        const otp = crypto_1.default.randomInt(Math.pow(10, length - 1), Math.pow(10, length));
        return otp.toString();
    }
    sendVendorWelcomeMessage(_a) {
        return __awaiter(this, arguments, void 0, function* ({ to }) {
            const template = templates_1.templates.vendorWelcomeMessage;
            const templateId = env_1.env.SMS_VENDOR_TEMPLATE_ID;
            const url = this.createMessageUrl({
                to,
                message: template,
                messageType: types_1.MessageType.WelcomeMessage,
                templateId,
            });
            return yield this.send(url);
        });
    }
}
exports.SmsClient = SmsClient;
