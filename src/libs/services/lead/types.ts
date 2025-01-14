import { Document } from "mongoose";

export interface ILead extends Document {
  firstName: string;
  middleName?: string;
  lastName: string;
  mobileNumber: string;
  emailID: string;
  sourceCode: string;
  lgAgentID?: string;
  cardType: "VISC" | "VPTL" | "PULM" | "CSC1" | "USS9";
  lgUID: string;
  breCode?: string;
  channelCode: "OMLG" | "SAPL";
  leadSource: "LG" | "LG_RKPL" | "LG_BankSaathi" | "ENCIRCLE";
  gemId1: string;
  gemId2: string;
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
