import crypto from "crypto";
import { OTP_RESPONSE_CODES } from "./utils";
import { templates } from "./templates";
import {
  CreateMessageUrl,
  InitOtpVerificationResponse,
  MessageType,
  SendOtp,
  SendWelcomeMessage,
  VerifyOtp,
} from "./types";
import { env } from "@/env/env";
import { OtpDBService } from "../otp/service";
import { UserService } from "../user/service";
import { Users } from "../mongo/schema";
import { JwtService } from "../jwt/jwtService";
import e from "express";

export class SmsClient {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly otpDbClient: OtpDBService;
  private readonly userService: UserService;
  private readonly jwtService: JwtService;
  static client: SmsClient;
  constructor() {
    this.apiKey = env.SMS_API_KEY;
    this.apiUrl = env.SMS_API_URL;
    this.otpDbClient = new OtpDBService();
    this.sendWelcomeMessage = this.sendWelcomeMessage.bind(this);
    this.createMessageUrl = this.createMessageUrl.bind(this);
    this.sendOtp = this.sendOtp.bind(this);
    this.getOtpTemplate = this.getOtpTemplate.bind(this);
    this.generateOtp = this.generateOtp.bind(this);
    this.initOtpVerification = this.initOtpVerification.bind(this);
    this.verifyOtp = this.verifyOtp.bind(this);
    this.send = this.send.bind(this);
    this.jwtService = new JwtService();
    this.userService = new UserService();
  }

  async send(input: RequestInfo | URL) {
    return await fetch(input);
  }

  static getClient() {
    if (!SmsClient.client) {
      SmsClient.client = new SmsClient();
    }
    return SmsClient.client;
  }

  async sendWelcomeMessage({ to }: SendWelcomeMessage) {
    const template = templates.welcomeMessage;
    const templateId = env.SMS_WELCOME_TEMPLATE_ID;
    const url = this.createMessageUrl({
      to,
      message: template,
      messageType: MessageType.WelcomeMessage,
      templateId,
    });
    return await this.send(url);
  }

  // Need to remove message type from here
  private createMessageUrl(input: CreateMessageUrl) {
    const { message, templateId, to, messageType } = input;
    if (messageType === MessageType.Otp) {
      const data = {
        key: process.env.SMS_OTP_KEY,
        text: message,
        phoneno: to,
        senderId: process.env.SMS_OTP_SENDER_ID,
        tempDltId: process.env.SMS_OTP_DLT_ID,
        route: "Domestic",
        trans: "1",
        unicode: "0",
        flash: "false",
        tiny: "false",
      };
      const url = new URL("https://sms.pixabits.in/smsapi/sms/get/send");
      url.search = new URLSearchParams(data).toString();
      return url.toString();
    } else {
      const encodedMessage = encodeURIComponent(message);
      return `${this.apiUrl}?channel=2.1&recipient=${to}&contentType=3.1&dr=false&msg=${encodedMessage}&user=${env.SMS_TATA_TEL_USERNAME}&pswd=${env.SMS_TATA_TEL_PASSWORD}&sender=${env.SMS_SENDER_ID}&PE_ID=${env.SMS_TATA_TEL_PE_ID}&Template_ID=${templateId}`;
    }
  }

  async initOtpVerification(
    input: SendOtp
  ): Promise<InitOtpVerificationResponse> {
    // Getting existing otp entry from the database
    const otpEntry = await this.otpDbClient.getOtpEntry(input.to);

    if (!otpEntry) {
      // Create a new entry in the database
      const code = this.generateOtp(6);

      const otpObject = {
        phoneNumber: input.to,
        code,
      };

      const otpResponse = await this.sendOtp({
        to: otpObject.phoneNumber,
        code: otpObject.code,
      });

      if (otpResponse) {
        const newOtpEntry = await this.otpDbClient.createOtpEntry({
          phoneNumber: input.to,
          code,
        });
        return {
          status: OTP_RESPONSE_CODES.OTP_SENT,
          data: newOtpEntry,
          isNewEntry: true,
        };
      }
    }

    const userInfo = await this.userService.getUserByPhoneNumber({
      phoneNumber: input.to,
    });

    if (!otpEntry?.verified && otpEntry?.code) {
      const newOtpResponse = await this.sendOtp({
        to: input?.to,
        code: otpEntry?.code,
      });

      if (newOtpResponse) {
        const updatedOtpEntry = await this.otpDbClient.updateOtpEntry({
          phoneNumber: input.to,
          code: otpEntry.code,
          lastSentAt: Date.now(),
          verified: false,
        });
        return {
          status: OTP_RESPONSE_CODES.OTP_SENT,
          data: updatedOtpEntry,
          isNewEntry: false,
          userInfo,
        };
      }
    }

    // For existing entry and verified otp, sending new otp.
    const code = this.generateOtp(6);
    const otpResponse = await this.sendOtp({
      to: input?.to,
      code,
    });

    if (otpResponse) {
      const updatedOtpEntry = await this.otpDbClient.updateOtpEntry({
        phoneNumber: input.to,
        code,
        lastSentAt: Date.now(),
        verified: false,
      });
      return {
        status: OTP_RESPONSE_CODES.OTP_SENT,
        data: updatedOtpEntry,
        isNewEntry: false,
        userInfo,
      };
    }

    return { status: OTP_RESPONSE_CODES.OTP_ALREADY_VERIFIED, data: otpEntry };
  }

  async verifyOtp({ phoneNumber, code, generateToken }: VerifyOtp) {
    const otpEntry = await this.otpDbClient.getOtpEntry(phoneNumber);
    if (!otpEntry) {
      return { status: OTP_RESPONSE_CODES.OTP_NOT_FOUND };
    }

    // Need to implement this for rate limiting
    // if (SmsUtils.isOtpExpired(otpEntry.lastSentAt)) {
    //   return { status: OTP_RESPONSE_CODES.OTP_EXPIRED }
    // }

    if (otpEntry.verified) {
      return { status: OTP_RESPONSE_CODES.OTP_ALREADY_VERIFIED };
    }

    const resultObj: Record<string, any> = {};
    const isValid = otpEntry.code === code;

    if (!isValid) {
      return { status: OTP_RESPONSE_CODES.INVALID_OTP_CODE };
    }

    resultObj.isValid = isValid;
    resultObj.status = OTP_RESPONSE_CODES.OTP_VERIFIED;

    await this.otpDbClient.updateOtpEntry({ phoneNumber, verified: true });

    // Getting the verified user info from the database
    const user = await Users.findOne({ phoneNumber });

    resultObj.user = user ? user.toJSON() : null;

    if (generateToken) {
      const token = await this.jwtService.createUserToken({ phoneNumber });
      resultObj.token = token;
    }

    return resultObj;
  }

  async sendOtp({ to, code }: { to: string; code: string }) {
    const template = this.getOtpTemplate(code);
    const templateId = env.SMS_OTP_TEMPLATE_ID;

    const url = this.createMessageUrl({
      to,
      message: template,
      messageType: MessageType.Otp,
      templateId,
    });

    try {
      const res = await this.send(url);

      if (!res.ok) {
        throw new Error("Failed to send OTP");
      }
      return await res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private getOtpTemplate(code: string) {
    return templates.otp.replace("{{code}}", code);
  }

  private generateOtp(length: number) {
    const otp = crypto.randomInt(
      Math.pow(10, length - 1),
      Math.pow(10, length)
    );
    return otp.toString();
  }
  async sendVendorWelcomeMessage({ to }: { to: string }) {
    const template = templates.vendorWelcomeMessage;
    const templateId = env.SMS_VENDOR_TEMPLATE_ID;
    const url = this.createMessageUrl({
      to,
      message: template,
      messageType: MessageType.WelcomeMessage,
      templateId,
    });

    return await this.send(url);
  }
}
