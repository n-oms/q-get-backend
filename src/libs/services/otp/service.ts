import { otps } from "../mongo/schema";
import { Otp } from "../mongo/types";


export class OtpDBService {

  constructor() {
    this.getOtpEntry = this.getOtpEntry.bind(this);
    this.createOtpEntry = this.createOtpEntry.bind(this);
    this.updateOtpEntry = this.updateOtpEntry.bind(this);
  }

  async getOtpEntry(phone: string) {
    try {
      const otp = await otps.findOne({ phoneNumber: phone });
      return otp?.toJSON();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createOtpEntry({
    phoneNumber,
    code,
  }: {
    phoneNumber: string;
    code: string;
  }) {
    try {
      const otp = await otps.create({
        phoneNumber: phoneNumber,
        code: code,
        verified: false,
        lastSentAt: Date.now(),
      });
      return otp.toJSON();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updateOtpEntry(input: Partial<Otp>) {
    try {
      const { phoneNumber } = input;
      delete input.phoneNumber;
      const otp = await otps.findOneAndUpdate(
        { phoneNumber },
        { ...input },
        { new: true },
      );
      return otp?.toJSON();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
