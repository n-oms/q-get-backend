import { UserStatus, UserType, VendorRegistrationStatus } from "./enums";

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
    scannedVendorId?: string
    isVendorRegistrationRequestSent?: boolean;
    vendorRegistrationStatus?: VendorRegistrationStatus;
    vendorInfo?: any
};
