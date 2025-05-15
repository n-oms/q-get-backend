import mongoose from "mongoose";
import { LmsUser } from "../types";

export const lmsUserSchema = new mongoose.Schema<LmsUser>(
  {},
  { strict: false }
);

export const LmsUsers =
  (mongoose.models.lmsUsers as mongoose.Model<LmsUser>) ||
  mongoose.model("lmsUsers", lmsUserSchema);
