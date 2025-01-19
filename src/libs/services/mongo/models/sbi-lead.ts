import mongoose from "mongoose";
import { ILead } from "../../lead/types";

const leadSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String, maxlength: 10 },
    lastName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    emailID: { type: String, required: true },
    sourceCode: { type: String, required: true },
    lgAgentID: { type: String, maxlength: 20 },
    cardType: {
      type: String,
      required: true,
      enum: ["VISC", "VPTL", "PULM", "CSC1", "SSU1"],
    },
    lgUID: { type: String, required: true },
    breCode: { type: String },
    channelCode: { type: String, required: true },
    leadSource: { type: String, required: true },
    filler1: String,
    filler2: String,
    filler3: String,
    filler4: String,
    filler5: String,
    action: { type: String, default: "LG-Create-Lead" },
    type: { type: String, default: "SPRINT_Partner" },
    status: String,
    leadID: String,
  },
  {
    timestamps: true,
  }
);

export const Leads = mongoose.model<ILead>("sbi-lead", leadSchema);
