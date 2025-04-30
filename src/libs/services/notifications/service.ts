// src/libs/services/notifications/service.ts
import { randomUUID } from "crypto";
import { Notifications } from "../mongo/models/notifications";
import { Notification } from "../mongo/types";
import { DbError } from "@/libs/error/error";
import { ClassUtils } from "@/libs/utils/classUtils";

export class NotificationService {
  constructor() {
    ClassUtils.bindMethods(this);
  }

  async createNotification({ 
    userId, 
    title, 
    message, 
    type = "system", 
    additionalData 
  }: {
    userId: string;
    title: string;
    message: string;
    type?: "system" | "user" | "promo" | "alert";
    additionalData?: Record<string, any>;
  }): Promise<Notification> {
    try {
      const notification = await Notifications.create({
        id: randomUUID(),
        userId,
        title,
        message,
        type,
        status: "unread",
        additionalData
      });
      return notification.toJSON();
    } catch (error) {
      throw new DbError(error.message || "Error creating notification");
    }
  }

  async getNotifications({ 
    userId, 
    type, 
    status, 
    limit = 10, 
    page = 1 
  }: {
    userId: string;
    type?: "system" | "user" | "promo" | "alert";
    status?: "read" | "unread";
    limit?: number;
    page?: number;
  }): Promise<{ notifications: Notification[], total: number }> {
    try {
      const query: Record<string, any> = { userId };
      
      if (type) {
        query.type = type;
      }
      
      if (status) {
        query.status = status;
      }
      
      const skip = (page - 1) * limit;
      
      const [notifications, total] = await Promise.all([
        Notifications.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Notifications.countDocuments(query)
      ]);
      
      return { notifications, total };
    } catch (error) {
      throw new DbError(error.message || "Error getting notifications");
    }
  }
  
  async getNotificationById({ 
    id, 
    userId 
  }: { 
    id: string, 
    userId: string 
  }): Promise<Notification | null> {
    try {
      const notification = await Notifications.findOne({ id, userId }).lean();
      return notification;
    } catch (error) {
      throw new DbError(error.message || "Error getting notification by id");
    }
  }

  async updateNotification({ 
    id, 
    userId, 
    updates 
  }: {
    id: string;
    userId: string;
    updates: {
      status?: "read" | "unread";
      title?: string;
      message?: string;
      additionalData?: Record<string, any>;
    };
  }): Promise<Notification | null> {
    try {
      const notification = await Notifications.findOneAndUpdate(
        { id, userId },
        { $set: updates },
        { new: true }
      ).lean();
      
      return notification;
    } catch (error) {
      throw new DbError(error.message || "Error updating notification");
    }
  }

  async deleteNotification({ 
    id, 
    userId 
  }: {
    id: string;
    userId: string;
  }): Promise<boolean> {
    try {
      const result = await Notifications.deleteOne({ id, userId });
      return result.deletedCount > 0;
    } catch (error) {
      throw new DbError(error.message || "Error deleting notification");
    }
  }
  
  async markAllAsRead({ 
    userId 
  }: { 
    userId: string 
  }): Promise<number> {
    try {
      const result = await Notifications.updateMany(
        { userId, status: "unread" },
        { $set: { status: "read" } }
      );
      
      return result.modifiedCount;
    } catch (error) {
      throw new DbError(error.message || "Error marking all notifications as read");
    }
  }
  
  async getUnreadCount({ 
    userId 
  }: { 
    userId: string 
  }): Promise<number> {
    try {
      return await Notifications.countDocuments({ userId, status: "unread" });
    } catch (error) {
      throw new DbError(error.message || "Error getting unread count");
    }
  }
}