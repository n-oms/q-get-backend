import mongoose from "mongoose";
import { User } from "../types";
import { UserType } from "../enums";

const userSchema = new mongoose.Schema<User>(
  {
    id: String,
    name: String,
    email: String,
    scannedVendorId: String,
    branchId: String,
    vendorId: {
      type: String,
      required: false,
    },
    phoneNumber: String,
    alternatePhone: String,
    userType: {
      type: String,
      enum: UserType,
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
      contactPersonName: String,
      vendorName: String,
      address: String,
      email: String,
      profession: String,
      attachment: mongoose.Schema.Types.Mixed,
      vendorPhoto: mongoose.Schema.Types.Mixed,
      businessName: String,
      alternatePhone: String,
    },
  },
  { timestamps: true }
);

export const Users =
  (mongoose.models.users as mongoose.Model<User>) ||
  mongoose.model<User>("users", userSchema);
