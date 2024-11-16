import { Otps } from "../mongo/schema";
import { Otp } from "../mongo/types";


export class OtpDBService {

  constructor() {
    this.getOtpEntry = this.getOtpEntry.bind(this);
    this.createOtpEntry = this.createOtpEntry.bind(this);
    this.updateOtpEntry = this.updateOtpEntry.bind(this);
  }

  async getOtpEntry(phone: string) {
    try {
      const otp = await Otps.findOne({ phoneNumber: phone });
      return otp?.toJSON();
    } catch (error) {
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
      const otp = await Otps.create({
        phoneNumber: phoneNumber,
        code: code,
        verified: false,
        lastSentAt: Date.now(),
      });
      return otp.toJSON();
    } catch (error) {
      throw error;
    }
  }

  async updateOtpEntry(input: Partial<Otp>) {
    try {
      const { phoneNumber } = input;
      delete input.phoneNumber;
      const otp = await Otps.findOneAndUpdate(
        { phoneNumber },
        { ...input },
        { new: true },
      );
      return otp?.toJSON();
    } catch (error) {
      throw error;
    }
  }
}
