import mongoose from "mongoose";
import { Scans as ScanType } from "../types";

export const scansSchema = new mongoose.Schema<ScanType>(
  {
    name: String,
    userId: String,
    vendorId: String,
    branchId: String,
    bankId: {
      type: String,
      required: false,
    },
    phoneNumber: String,
  },
  { timestamps: true, strict: false }
);

export const Scans =
  (mongoose.models.scans as mongoose.Model<ScanType>) ||
  mongoose.model<ScanType>("scans", scansSchema);
