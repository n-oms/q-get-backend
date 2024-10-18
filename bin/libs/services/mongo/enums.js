"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateVendorInfoStatus = exports.VendorRegistrationStatus = exports.VendorCreditStatus = exports.ApplicationStatus = exports.UserStatus = exports.UserType = void 0;
var UserType;
(function (UserType) {
    UserType["Vendor"] = "vendor";
    UserType["Customer"] = "customer";
})(UserType || (exports.UserType = UserType = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["VENDOR_NOT_APPROVED"] = "VENDOR_NOT_APPROVED";
    UserStatus["VENDOR_APPROVED"] = "VENDOR_APPROVED";
    UserStatus["VENDOR_REJECTED"] = "VENDOR_REJECTED";
    UserStatus["SELF_REGISTERED_CUSTOMER"] = "SELF_REGISTERED_CUSTOMER";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["APPROVED"] = "APPROVED";
    ApplicationStatus["PENDING"] = "PENDING";
    ApplicationStatus["REJECTED"] = "REJECTED";
    ApplicationStatus["LOGIN"] = "LOGIN";
    ApplicationStatus["BILLED"] = "BILLED";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
var VendorCreditStatus;
(function (VendorCreditStatus) {
    VendorCreditStatus["TO_BE_RAISED"] = "TO_BE_RAISED";
    VendorCreditStatus["REJECTED"] = "REJECTED";
    VendorCreditStatus["RAISED"] = "RAISED";
    VendorCreditStatus["PAID"] = "PAID";
    VendorCreditStatus["APPROVED"] = "APPROVED";
})(VendorCreditStatus || (exports.VendorCreditStatus = VendorCreditStatus = {}));
var VendorRegistrationStatus;
(function (VendorRegistrationStatus) {
    VendorRegistrationStatus["PENDING"] = "PENDING";
    VendorRegistrationStatus["APPROVED"] = "APPROVED";
    VendorRegistrationStatus["REJECTED"] = "REJECTED";
    VendorRegistrationStatus["NOT_APPLIED"] = "NOT_APPLIED";
})(VendorRegistrationStatus || (exports.VendorRegistrationStatus = VendorRegistrationStatus = {}));
var UpdateVendorInfoStatus;
(function (UpdateVendorInfoStatus) {
    UpdateVendorInfoStatus["PENDING"] = "PENDING";
    UpdateVendorInfoStatus["APPROVED"] = "APPROVED";
    UpdateVendorInfoStatus["REJECTED"] = "REJECTED";
})(UpdateVendorInfoStatus || (exports.UpdateVendorInfoStatus = UpdateVendorInfoStatus = {}));
