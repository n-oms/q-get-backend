"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const enums_1 = require("../enums");
const userSchema = new mongoose_1.default.Schema({
    id: String,
    name: String,
    email: String,
    vendorId: {
        type: String,
        required: false,
    },
    phoneNumber: String,
    alternatePhone: String,
    userType: {
        type: String,
        enum: enums_1.UserType,
    },
    isWelcomeMessageSent: Boolean,
    status: String,
    isVendorRegistrationRequestSent: Boolean,
    vendorRegistrationStatus: String,
    vendorInfo: {
        bankAccountName: String,
        bankName: String,
        accountNumber: String,
        ifscCode: String,
        fullName: String,
        branchName: String,
        upiId: String,
        shopOwnerName: String,
        vendorType: String,
        shopAddress: String,
        pincode: String,
        phoneNumber: String,
        aadhaarNumber: String,
    },
}, { timestamps: true });
exports.users = mongoose_1.default.models.users ||
    mongoose_1.default.model("users", userSchema);
