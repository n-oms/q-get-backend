export enum UserType {
  Vendor = "vendor",
  Customer = "customer",
}

export enum UserStatus {
  VENDOR_NOT_APPROVED = "VENDOR_NOT_APPROVED",
  VENDOR_APPROVED = "VENDOR_APPROVED",
  VENDOR_REJECTED = "VENDOR_REJECTED",
  SELF_REGISTERED_CUSTOMER = "SELF_REGISTERED_CUSTOMER",
}

export enum ApplicationStatus {
  APPROVED = "APPROVED",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  LOGIN = "LOGIN",
  BILLED = "BILLED",
}

export enum VendorCreditStatus {
  TO_BE_RAISED = "TO_BE_RAISED",
  REJECTED = "REJECTED",
  RAISED = "RAISED",
  PAID = "PAID",
  APPROVED = "APPROVED",
}

export enum VendorRegistrationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  NOT_APPLIED = "NOT_APPLIED",
}

export enum UpdateVendorInfoStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}
export enum InvoiceStatus {
  RAISED = "RAISED",
  PAID = "PAID",
}
