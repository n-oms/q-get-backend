import mongoose from "mongoose";
import { EnquiryRequest } from "../types";

// We're only adding one optional field to avoid major schema changes
export interface EnquiryRequestWithProduct extends EnquiryRequest {
  productName?: string;
}

// Keep the existing schema structure and add the new field
export const enquiryRequestSchema = new mongoose.Schema<EnquiryRequestWithProduct>(
  {
    enquiryServiceType: String,
    id: String,
    lastSentAt: Number,
    name: String,
    phoneNumber: String,
    // Add the new field but don't make it required
    productName: { 
      type: String,
      required: false
    }
  },
  { timestamps: true }
);

// Add an index but don't enforce uniqueness
enquiryRequestSchema.index({ 
  phoneNumber: 1, 
  enquiryServiceType: 1, 
  productName: 1 
});

export const EnquiryModel = mongoose.model(
  "enquiryRequests",
  enquiryRequestSchema
);