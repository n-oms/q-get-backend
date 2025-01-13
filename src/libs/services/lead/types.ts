import { Document } from 'mongoose';

export interface ILead extends Document {
  firstName: string;
  middleName?: string;
  lastName: string;
  mobileNumber: string;
  emailID: string;
  sourceCode: string;
  lgAgentID?: string;
  cardType: "VISC" | "VPTL" | "PULM" | "CSC1" | "SSU1";
  lgUID: string;
  breCode?: string;
  channelCode: string;
  leadSource: string;
  filler1?: string;
  filler2?: string;
  filler3?: string;
  filler4?: string;
  filler5?: string;
  action: string;
  type: string;
  status?: string;
  leadID?: string;
  createdAt?: Date;
  updatedAt?: Date;
}