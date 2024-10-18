import mongoose, { FlattenMaps } from "mongoose";
import { OTP_RESPONSE_CODES } from "./utils";
import { Otp } from "../mongo/types";

export type SendWelcomeMessage = {
  to: string;
};

export enum MessageType {
  WelcomeMessage = "sendapi.php",
  Otp = "otp_api.php",
}

export type CreateMessageUrl = {
  to: string;
  message: string;
  messageType: MessageType;
  templateId: string;
};

export type SendOtp = {
  to: string;
};

export type InitOtpVerificationResponse = {
  status: OTP_RESPONSE_CODES;
  isNewEntry?: boolean;
  data: FlattenMaps<Otp & { _id: mongoose.Types.ObjectId }> | undefined;
  userInfo?: any
};

export type VerifyOtp = {
  phoneNumber: string;
  code: string;
};

export type SendWelcomeMessageType = {
  to: string | undefined;
  service: string;
};
