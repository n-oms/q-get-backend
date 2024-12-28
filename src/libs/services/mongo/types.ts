import { EnquiryServiceType } from "@/libs/constants/common";
import {
  ApplicationStatus,
  UserStatus,
  UserType,
  VendorCreditStatus,
  VendorRegistrationStatus,
} from "./enums";

export interface BankCard extends Document {
  cardId: string;
  title: string;
  link: string;
  bankName: string;
  imageUrl?: {
    s3Key: string;
    fileType: string;
    fileName: string;
    imageUrl: string;
  };
  bankLogo?: {
    s3Key: string;
    fileType: string;
    fileName: string;
    imageUrl: string;
  };
  type: "CODE" | "IMAGE";
  orientation: "PORTRAIT" | "LANDSCAPE";
  redirectParam?: string;
  benefits: {
    title: string;
    items: string[];
  };
}
export type Otp = {
  phoneNumber: string;
  verified: boolean;
  lastSentAt: number;
  code: string;
  attempts: {
    attemptTime: number;
    code: string;
  };
};

export type User = {
  id: string;
  name: string;
  email?: string;
  phoneNumber: string;
  alternatePhone?: string;
  vendorId?: string;
  userType: UserType;
  isWelcomeMessageSent: boolean;
  status: UserStatus;
  scannedVendorId?: string;
  isVendorRegistrationRequestSent?: boolean;
  vendorRegistrationStatus?: VendorRegistrationStatus;
  vendorInfo?: any;
};

export type Scans = {
  _id: string;
  userId: string;
  vendorId: string;
  createdAt: string;
  updatedAt: string;
  bankId: string;
  phoneNumber: string;
  name: string;
};

export type Application = {
  _id: string;
  customerId: string;
  customerName: string;
  vendorId: string;
  createdAt: string;
  updatedAt: string;
  bankId: string;
  phoneNumber: string;
  status: ApplicationStatus;
  applicationId: string;
  tenant: string;
  branchId: string;
  memershipshipId: string;
  createdByEmail: string;
  createdByName: string;
  bankName: string;
};

export type VendorCreditsType = {
  vendorId: string;
  credit: number;
  name: string;
  applicationId: string;
  status: VendorCreditStatus;
  bankInfo: {
    bankName: string;
    bankId: string;
  };
  invoiceReqId?: string;
  message?: string;
  amountPaid?: number;
  creditId: string;
};

export type Organization = {
  tenantId: string;
  wsUrl: string;
  features: {
    loans: boolean;
    insurances: boolean;
  };
};

export type Invoice = {
  invoiceReqId: string;
  amountPaid: number;
  status: string;
  amountRaised: number;
  vendorId: string;
  message: string;
};

export type Faqs = {
  question: string;
  answer: string;
  coverImageUrl?: string;
  id: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  imageUrl?: string;
  category: 'CREDIT_CARD' | 'LOAN' | 'INSURANCE' | 'CIBIL' | 'FINANCIAL_TIPS';
  tags: string[];
  author: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  publishedAt: Date;
  readingTime: number;
  relatedPosts?: string[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonicalUrl?: string;
  };
}

export type EnquiryRequest = {
  id: string;
  phoneNumber: string;
  name: string;
  enquiryServiceType: EnquiryServiceType;
  lastSentAt: number;
};
