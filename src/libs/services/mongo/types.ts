import {
  ApplicationStatus,
  UserStatus,
  UserType,
  VendorCreditStatus,
  VendorRegistrationStatus,
} from "./enums";

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
  orgId: string;
};

export type Invoice = {
    invoiceReqId: string;
    amountPaid: number;
    status: string;
    amountRaised: number;
    vendorId: string;
    message: string;
  };
