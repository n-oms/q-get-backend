import mongoose from "mongoose";
import { Scans as ScanType } from "../types";

export const scansSchema = new mongoose.Schema<ScanType>(
  {
    userId: String,
    vendorId: String,
    bankId: {
      type: String,
      required: false,
    },
    phoneNumber: String,
  },
  { timestamps: true },
);

export const scans =
  (mongoose.models.scans as mongoose.Model<ScanType>) ||
  mongoose.model<ScanType>("scans", scansSchema);
