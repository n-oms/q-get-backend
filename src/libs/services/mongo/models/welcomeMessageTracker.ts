import mongoose, { Schema } from "mongoose";
import { WelcomeMessageTracker as WelcomeMessageTrackerType } from "../types";

export const welcomeMessageTrackerSchema =
  new Schema<WelcomeMessageTrackerType>({
    phoneNumber: { type: String, required: true },
    service: { type: String, required: true },
    lastSentAt: { type: Number, required: true },
  });

export const WelcomeMessageTracker = mongoose.model<WelcomeMessageTrackerType>(
  "welcomeMessageTracker",
  welcomeMessageTrackerSchema
);
