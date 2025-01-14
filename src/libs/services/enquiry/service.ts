import { EnquiryServiceType, EnquiryTrigger } from "@/libs/constants/common";
import { SQS_QUEUES } from "@/libs/constants/sqs";
import { ClassUtils } from "@/libs/utils/classUtils";
import { EnquiryModel } from "../mongo/models/enquiry";
import { User } from "../mongo/types";
import { OrganizationService } from "../organization/service";
import { SqsService } from "../sqs/service";

const ENQUIRY_REQUEST_EXPIRATION_TIME = 24 * 60 * 60 * 1000;

export class EnquiryService {
  private readonly sqsService: SqsService;
  private readonly organizationService: OrganizationService;

  constructor() {
    this.organizationService = new OrganizationService();
    this.sqsService = SqsService.getServiceClient();
    ClassUtils.bindMethods<EnquiryService>(this);
  }

  async sendEnquiry({
    enquiryServiceType,
    userInfo,
    data,
    enquiryTrigger,
  }: {
    userInfo: User;
    enquiryServiceType: EnquiryServiceType;
    data?: Record<string, unknown>;
    enquiryTrigger: EnquiryTrigger;
  }) {
    console.log(data);

    let isLastEnquiryExpired = true;

    if (enquiryTrigger === EnquiryTrigger.AUTOMATIC) {
      isLastEnquiryExpired = await this.isLastEquiryExpired({
        enquiryServiceType,
        phoneNumber: userInfo.id || userInfo.phoneNumber,
      });
    }

    if (!isLastEnquiryExpired) {
      return;
    }

    // Need to discuss with the team about the message data
    // const messageData = this.getServiceSpecificMessageData({
    //   serviceType: enquiryServiceType,
    //   data,
    // });

    const sqsPayload = await this.getSqsMessagePayload({
      userInfo,
      enquiryServiceType,
      data,
    });

    const sqsResponse = await this.sqsService.sendMessage({
      message: sqsPayload,
      queueUrl: SQS_QUEUES.RAISE_INVOICE_REQUEST_QUEUE.url,
    });

    if (sqsResponse.$metadata.httpStatusCode === 200) {
      return await this.updateEnquiry({
        phoneNumber: userInfo.id || userInfo.phoneNumber,
        enquiryServiceType,
        data: {
          lastSentAt: Date.now(),
        },
      });
    } else {
      throw new Error("Failed to send enquiry");
    }
  }

  getServiceSpecificMessageData({
    data,
    serviceType,
  }: {
    data: Record<string, unknown>;
    serviceType: EnquiryServiceType;
  }): Record<string, unknown> {
    switch (serviceType) {
      case EnquiryServiceType.CREDIT_CARD:
        return {
          cardName: data.cardName,
          bankName: data.bankName,
        };
      default:
        return {};
    }
  }

  async updateEnquiry({
    enquiryServiceType,
    phoneNumber,
    data,
  }: {
    phoneNumber: string;
    enquiryServiceType: EnquiryServiceType;
    data: {
      lastSentAt: number;
    };
  }) {
    return await EnquiryModel.updateOne(
      { phoneNumber, enquiryServiceType },
      { lastSentAt: data.lastSentAt },
      { upsert: true }
    );
  }

  async getSqsMessagePayload({
    userInfo,
    enquiryServiceType,
    data,
  }: {
    userInfo: User;
    enquiryServiceType: EnquiryServiceType;
    data?: Record<string, unknown>;
  }) {
    const orgInfo = await this.organizationService.getOrganizationInfo();
    return {
      eventId: "vendor-generic-event",
      subEvent: "user-lead-generated",
      tenantId: orgInfo.tenantId,
      vendorId: userInfo.vendorId || "",
      eventDetails: {
        phoneNumber: userInfo.id || userInfo.phoneNumber,
        name: userInfo.name,
        enquiry: enquiryServiceType,
        userType: userInfo.userType,
        ...data,
      },
    };
  }

  async isLastEquiryExpired({
    enquiryServiceType,
    phoneNumber,
  }: {
    phoneNumber: string;
    enquiryServiceType: EnquiryServiceType;
  }) {
    const enquiry = await this.getEnquiryEntry({
      phoneNumber,
      enquiryServiceType,
    });

    const lastSentAt = enquiry?.lastSentAt;

    if (!lastSentAt) {
      return true;
    }

    const currentTime = Date.now();
    return currentTime - lastSentAt >= ENQUIRY_REQUEST_EXPIRATION_TIME;
  }

  async getEnquiryEntry({
    enquiryServiceType,
    phoneNumber,
  }: {
    phoneNumber: string;
    enquiryServiceType: EnquiryServiceType;
  }) {
    return await EnquiryModel.findOne({ phoneNumber, enquiryServiceType });
  }
}
