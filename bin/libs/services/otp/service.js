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
exports.OtpDBService = void 0;
const schema_1 = require("../mongo/schema");
class OtpDBService {
    constructor() {
        this.getOtpEntry = this.getOtpEntry.bind(this);
        this.createOtpEntry = this.createOtpEntry.bind(this);
        this.updateOtpEntry = this.updateOtpEntry.bind(this);
    }
    getOtpEntry(phone) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const otp = yield schema_1.otps.findOne({ phoneNumber: phone });
                return otp === null || otp === void 0 ? void 0 : otp.toJSON();
            }
            catch (error) {
                console.error(error);
                throw error;
            }
        });
    }
    createOtpEntry(_a) {
        return __awaiter(this, arguments, void 0, function* ({ phoneNumber, code, }) {
            try {
                const otp = yield schema_1.otps.create({
                    phoneNumber: phoneNumber,
                    code: code,
                    verified: false,
                    lastSentAt: Date.now(),
                });
                return otp.toJSON();
            }
            catch (error) {
                console.error(error);
                throw error;
            }
        });
    }
    updateOtpEntry(input) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { phoneNumber } = input;
                delete input.phoneNumber;
                const otp = yield schema_1.otps.findOneAndUpdate({ phoneNumber }, Object.assign({}, input), { new: true });
                return otp === null || otp === void 0 ? void 0 : otp.toJSON();
            }
            catch (error) {
                console.error(error);
                throw error;
            }
        });
    }
}
exports.OtpDBService = OtpDBService;
