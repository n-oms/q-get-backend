import mongoose from "mongoose";
import { Application as ApplicationType } from "../types";

export const applicationSchema = new mongoose.Schema<ApplicationType>(
  {
    bankId: String,
    phoneNumber: String,
    status: String,
    customerId: String,
    vendorId: String,
    customerName: String,
    bankName: String,
    applicationId: String,
    tenant: String,
    branchId: String,
    memershipshipId: String,
    createdByEmail: String,
    createdByName: String,
  },
  { timestamps: true },
);

export const applications =
  (mongoose.models.applications as mongoose.Model<ApplicationType>) ||
  mongoose.model<ApplicationType>("applications", applicationSchema);
