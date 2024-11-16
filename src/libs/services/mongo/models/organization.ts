import mongoose from "mongoose";
import { Organization as OrganizationType } from "../types";

export const organizationSchema = new mongoose.Schema<OrganizationType>(
  {
    orgId: String,
  },
  { strict: false }
);

export const Organization =
  (mongoose.models.organization as mongoose.Model<OrganizationType>) ||
  mongoose.model<OrganizationType>("organization", organizationSchema);
