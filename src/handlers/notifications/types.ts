// src/handlers/notifications/types.ts
import { z } from "zod";

export enum NotificationHandlerActions {
  MARK_ALL_READ = "MARK_ALL_READ",
}

export const createNotificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z.enum(["system", "user", "promo", "alert"]).optional(),
  additionalData: z.record(z.any()).optional(),
});

export const updateNotificationSchema = z.object({
  status: z.enum(["read", "unread"]).optional(),
  title: z.string().optional(),
  message: z.string().optional(),
  additionalData: z.record(z.any()).optional(),
});

export const markAllReadSchema = z.object({
  action: z.literal(NotificationHandlerActions.MARK_ALL_READ),
});

export type GetNotificationsHandlerInput = {
  query: {
    type?: "system" | "user" | "promo" | "alert";
    status?: "read" | "unread";
    limit?: number;
    page?: number;
  };
};

export type CreateNotificationHandlerInput = {
  body: z.infer<typeof createNotificationSchema>;
};

export type UpdateNotificationHandlerInput = {
  params: {
    id: string;
  };
  body: z.infer<typeof updateNotificationSchema>;
};

export type DeleteNotificationHandlerInput = {
  params: {
    id: string;
  };
};

export type MarkAllReadHandlerInput = {
  body: z.infer<typeof markAllReadSchema>;
};