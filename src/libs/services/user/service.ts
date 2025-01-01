import { UserStatus, UserType, VendorRegistrationStatus } from "../mongo/enums";
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

  async getVendorUser({ phoneNumber }: { phoneNumber: string }) {
    const result = await Users.findOne({
      phoneNumber,
      userType: UserType.Vendor,
    });
    return result;
  }

  async getUserCountByVendorId({
    vendorId,
    phoneNumber,
  }: {
    vendorId: string;
    phoneNumber: string;
  }) {
    const result = await Users.countDocuments({
      vendorId,
      phoneNumber: { $ne: phoneNumber },
    });
    return result;
  }

  async createCustomerUser({
    phoneNumber,
    name,
    scannedVendorId,
  }: {
    phoneNumber: string;
    name: string;
    scannedVendorId?: string;
  }) {
    const user = await Users.create({
      id: phoneNumber,
      phoneNumber,
      name,
      userType: UserType.Customer,
      status: UserStatus.SELF_REGISTERED_CUSTOMER,
      isWelcomeMessageSent: false,
      scannedVendorId,
      vendorRegistrationStatus: VendorRegistrationStatus.NOT_APPLIED,
    });
    return user
  }
}
