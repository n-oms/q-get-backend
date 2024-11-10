import mongoose from "mongoose";
import { Organization } from "../types";

export const organizationSchema = new mongoose.Schema<Organization>({
orgId: String
}, {strict: false});


export const organization = mongoose.models.organization as mongoose.Model<Organization> || mongoose.model<Organization>("organization", organizationSchema);