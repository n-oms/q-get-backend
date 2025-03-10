import { EnquiryServiceType, EnquiryTrigger } from "@/libs/constants/common";
import { SQS_QUEUES } from "@/libs/constants/sqs";
import { ClassUtils } from "@/libs/utils/classUtils";
import { EnquiryModel } from "../mongo/models/enquiry";
import { User } from "../mongo/types";
import { OrganizationService } from "../organization/service";
import { SqsService } from "../sqs/service";

const ENQUIRY_REQUEST_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

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

    // Extract the product name for this specific product
    const productName = this.getProductName(enquiryServiceType, data);
    const phoneNumber = userInfo.id || userInfo.phoneNumber;

    let isLastEnquiryExpired = true;

    // If we have a specific product name, check product-specific expiration
    if (productName) {
      const existingProductEnquiry = await EnquiryModel.findOne({ 
        phoneNumber, 
        enquiryServiceType,
        productName 
      });

      if (existingProductEnquiry && existingProductEnquiry.lastSentAt) {
        const currentTime = Date.now();
        isLastEnquiryExpired = 
          currentTime - existingProductEnquiry.lastSentAt >= ENQUIRY_REQUEST_EXPIRATION_TIME;
      }
    } 
    // If no product name or handling automatic triggers (keep original logic) 
    else if (enquiryTrigger === EnquiryTrigger.AUTOMATIC) {
      isLastEnquiryExpired = await this.isLastEquiryExpired({
        enquiryServiceType,
        phoneNumber
      });
    }

    if (!isLastEnquiryExpired) {
      // Keep original behavior - just return without a specific error
      return;
    }

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
      // Now create or update the enquiry record
      return await this.updateEnquiryWithProduct({
        phoneNumber,
        enquiryServiceType,
        productName,
        lastSentAt: Date.now()
      });
    } else {
      throw new Error("Failed to send enquiry");
    }
  }

  // Helper method to extract the product name based on service type
  getProductName(
    enquiryServiceType: EnquiryServiceType,
    productData?: Record<string, unknown>
  ): string | undefined {
    if (!productData) return undefined;

    switch (enquiryServiceType) {
      case EnquiryServiceType.CREDIT_CARD:
        return productData.cardName as string;
        
      case EnquiryServiceType.LOAN:
        return productData.loanName as string || productData.loanType as string || 'N/A';
        
      case EnquiryServiceType.INSURANCE:
        return productData.insuranceName as string || productData.policyName as string || 'N/A';
        
      case EnquiryServiceType.INVESTMENT:
        return productData.investmentName as string || productData.schemeName as string || 'N/A';
        
      default:
        return productData.productName as string;
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

  // Original method - preserved for backward compatibility
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

  // New method that handles product-specific storage
  async updateEnquiryWithProduct({
    enquiryServiceType,
    phoneNumber,
    productName,
    lastSentAt
  }: {
    phoneNumber: string;
    enquiryServiceType: EnquiryServiceType;
    productName?: string;
    lastSentAt: number;
  }) {
    if (productName) {
      // If we have a product name, store with product specificity
      return await EnquiryModel.updateOne(
        { phoneNumber, enquiryServiceType, productName },
        { lastSentAt, productName },
        { upsert: true }
      );
    } else {
      // Otherwise use the original method for backward compatibility
      return await this.updateEnquiry({
        phoneNumber,
        enquiryServiceType,
        data: { lastSentAt }
      });
    }
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