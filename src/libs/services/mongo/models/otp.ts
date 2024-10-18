import mongoose from "mongoose";
import { Otp as OtpType } from "../types";

export const otpSchema = new mongoose.Schema<OtpType>(
  {
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
  },
  { timestamps: true },
);

export const otps =
  (mongoose.models.otps as mongoose.Model<OtpType>) ||
  mongoose.model<OtpType>("otps", otpSchema);
