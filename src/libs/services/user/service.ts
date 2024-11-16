import { Users } from "../mongo/schema";

export class UserService {
  async getUserByPhoneNumber({ phoneNumber }: { phoneNumber: string }) {
    const result = await Users.findOne({ phoneNumber });
    return result.toJSON();
  }
  async getUsersByVendorId({ vendorId }: { vendorId: string }) {
    const result = await Users.find({ vendorId });
    return result;
  }
  async getUserCountByVendorId({ vendorId ,phoneNumber}: { vendorId: string,phoneNumber:string }) {
    const result = await Users.countDocuments({ vendorId, phoneNumber: { $ne: phoneNumber } });
    return result;
  }
}
