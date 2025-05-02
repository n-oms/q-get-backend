import { ClassUtils } from "@/libs/utils/classUtils";
import { UserStatus, UserType, VendorRegistrationStatus } from "../mongo/enums";
import { Users } from "../mongo/schema";
import { User } from "../mongo/types";
import { OrganizationService } from "../organization/service";
import { SqsService } from "../sqs/service";
import { SQS_QUEUES } from "@/libs/constants/sqs";

export class UserService {
  private readonly organizationService: OrganizationService;
  private readonly sqsService: SqsService;

  constructor() {
    this.organizationService = new OrganizationService();
    this.sqsService = new SqsService();
    ClassUtils.bindMethods(this);
  }

  async getUserByPhoneNumber({ phoneNumber }: { phoneNumber: string }) {
    const result = await Users.findOne({ phoneNumber });
    return result ? result.toJSON() : null;
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
    return result ? result.toJSON() : null;
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
    scannedBranchId,
  }: {
    phoneNumber: string;
    name: string;
    scannedVendorId?: string;
    scannedBranchId?: string;
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
      scannedBranchId,
    });
    return user;
  }

  async updateUser({
    phoneNumber,
    updateData,
  }: {
    phoneNumber: string;
    updateData: Partial<User>;
  }) {
    const user = await Users.findOneAndUpdate(
      { phoneNumber },
      { ...updateData },
      { new: true }
    );
    return user ? user.toJSON() : null;
  }

  async sendVendorRegistrationRequest({ vendorInfo }: { vendorInfo: any }) {
    const orgInfo = await this.organizationService.getOrganizationInfo();

    const message = {
      eventId: "vendor-generic-event",
      subEvent: "vendor-registration-request",
      tenantId: orgInfo.tenantId,
      vendorId: "",
      eventDetails: {
        ...vendorInfo,
        phoneNumber: vendorInfo.phoneNumber,
        name: vendorInfo.name,
      },
    };
    const response = await this.sqsService.sendMessage({
      message,
      queueUrl: SQS_QUEUES.RAISE_INVOICE_REQUEST_QUEUE.url,
    });
    return response;
  }

  async getVendorByVendorId(vendorId: string) {
    console.log('Searching for vendorId:', vendorId);
    const vendor = await Users.findOne({ vendorId }).lean();
    console.log('Found vendor:', vendor);
    return vendor;
  }
}
