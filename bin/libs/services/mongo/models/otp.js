"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otps = exports.otpSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.otpSchema = new mongoose_1.default.Schema({
    code: String,
    phoneNumber: String,
    verified: Boolean,
    lastSentAt: Number,
    attempts: {
        type: {
            attemptTime: Number,
            code: String,
        },
    },
}, { timestamps: true });
exports.otps = mongoose_1.default.models.otps ||
    mongoose_1.default.model("otps", exports.otpSchema);
