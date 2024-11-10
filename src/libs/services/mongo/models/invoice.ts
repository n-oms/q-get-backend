import mongoose from "mongoose";
import { Invoice } from "../types";

export const invoiceSchema = new mongoose.Schema<Invoice>(
  {
    amountPaid: Number,
    invoiceReqId: String,
    status: String,
    amountRaised: Number,
    vendorId: String,
    message: String,
  },
  { timestamps: true },
);

export const Invoices =
  (mongoose.models.invoices as mongoose.Model<Invoice>) ||
  mongoose.model<Invoice>("invoices", invoiceSchema);
