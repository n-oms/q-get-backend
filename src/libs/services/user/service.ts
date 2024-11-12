import { users } from "../mongo/schema";

export class UserService {
  async getUserByPhoneNumber({ phoneNumber }: { phoneNumber: string }) {
    const result = await users.findOne({ phoneNumber });
    return result.toJSON();
  }
  async getUserByVendorId({ vendorId }: { vendorId: string }) {
    const result = await users.find({ vendorId });
    return result;
  }
  async getUserCountByVendorId({ vendorId }: { vendorId: string }) {
    const result = await users.countDocuments({ vendorId });
    return result;
  }
}
