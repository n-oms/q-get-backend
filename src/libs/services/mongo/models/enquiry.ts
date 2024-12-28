import mongoose from "mongoose";
import { EnquiryRequest } from "../types";

export const enquiryRequestSchema = new mongoose.Schema<EnquiryRequest>(
  {
    enquiryServiceType: String,
    id: String,
    lastSentAt: Number,
    name: String,
    phoneNumber: String,
  },
  { timestamps: true }
);

export const EnquiryModel = mongoose.model(
  "enquiryRequests",
  enquiryRequestSchema
);
