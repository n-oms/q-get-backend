// src/libs/services/mongo/models/notifications.ts
import mongoose from "mongoose";
import { Notification } from "../types";

export const notificationSchema = new mongoose.Schema<Notification>(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["system", "user", "promo", "alert"],
      default: "system" 
    },
    status: { 
      type: String, 
      enum: ["read", "unread"],
      default: "unread" 
    },
    additionalData: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Notifications =
  (mongoose.models.notifications as mongoose.Model<Notification>) ||
  mongoose.model<Notification>("notifications", notificationSchema);