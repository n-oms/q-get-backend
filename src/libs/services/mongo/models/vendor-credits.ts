import mongoose from "mongoose";
import {  VendorCreditsType } from "../types";

export const vendorCreditsSchema = new mongoose.Schema<VendorCreditsType>(
  {
    credit: Number,
    name: String,
    vendorId: String,
    applicationId: String,
    status: String,
    bankInfo: {
      bankName: String,
      bankId: String,
    },
    invoiceReqId: String,
    amountPaid: Number,
    message: String,
  },
  { timestamps: true },
);

export const VendorCredits =
  (mongoose.models.vendorCredits as mongoose.Model<VendorCreditsType>) ||
  mongoose.model<VendorCreditsType>("vendorCredits", vendorCreditsSchema);
