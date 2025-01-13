import mongoose from 'mongoose';
import { ILead } from '../../lead/types';

const leadSchema = new mongoose.Schema({
  firstName: { type: String, required: true, maxlength: 12, match: /^[a-zA-Z]*$/ },
  middleName: { type: String, maxlength: 10, match: /^[a-zA-Z\s]*$/ },
  lastName: { type: String, required: true, maxlength: 16, match: /^[a-zA-Z]*$/ },
  mobileNumber: { type: String, required: true, match: /^[0-9]{10}$/ },
  emailID: { type: String, required: true, maxlength: 50, match: /^[A-Za-z0-9\.\@_-]*$/ },
  sourceCode: { type: String, required: true, maxlength: 15, match: /^[a-zA-Z0-9]*$/ },
  lgAgentID: { type: String, maxlength: 20, match: /^[a-zA-Z0-9]*$/ },
  cardType: { type: String, required: true, enum: ["VISC", "VPTL", "PULM", "CSC1", "SSU1"] },
  lgUID: { type: String, required: true, maxlength: 120, match: /^[a-zA-Z0-9]*$/ },
  breCode: { type: String, maxlength: 9, match: /^[0-9]*$/ },
  channelCode: { type: String, required: true, maxlength: 4, match: /^[a-zA-Z]*$/ },
  leadSource: { type: String, required: true, maxlength: 30, match: /^[a-zA-Z0-9]*$/ },
  filler1: String,
  filler2: String,
  filler3: String,
  filler4: String,
  filler5: String,
  action: { type: String, default: "LG-Create-Lead" },
  type: { type: String, default: "SPRINT_Partner" },
  status: String,
  leadID: String,
}, {
  timestamps: true
});

export const Leads = mongoose.model<ILead>('sbi-lead', leadSchema);