// src/handlers/notifications/delete/handler.ts
import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { Operations } from "@/libs/enums/common";
import { BadRequestExecption } from "@/libs/error/error";
import { NotificationService } from "@/libs/services/notifications/service";
import { ApiRequest, ApiResponse, IHandler } from "@/libs/types/common";
import { OPERATION_IDS } from "@/libs/constants/operation-ids";
import { DeleteNotificationHandlerInput } from "../types";

export class DeleteNotificationHandler implements IHandler {
  operation: Operations;
  isIdempotent: boolean;
  operationId: string;
  resource: string;
  validations: any[];
  notificationService: NotificationService;
  isAuthorizedAccess?: boolean;
  
  constructor() {
    this.operation = Operations.DELETE;
    this.isIdempotent = true;
    this.isAuthorizedAccess = true;
    this.operationId = OPERATION_IDS.NOTIFICATIONS.DELETE_NOTIFICATION;
    this.resource = HTTP_RESOURCES.NOTIFICATIONS.DELETE_NOTIFICATION;
    this.validations = [];
    this.notificationService = new NotificationService();
    this.handler = this.handler.bind(this);
  }

  async handler(
    req: ApiRequest<DeleteNotificationHandlerInput>,
    res: ApiResponse,
    next
  ) {
    try {
      const { userInfo } = req;
      const { id } = req.params;
      
      if (!userInfo || !userInfo.id) {
        throw new BadRequestExecption("User information is required");
      }
      
      if (!id) {
        throw new BadRequestExecption("Notification ID is required");
      }
      
      const success = await this.notificationService.deleteNotification({
        id,
        userId: userInfo.id
      });
      
      if (!success) {
        return res.status(404).send({ message: "Notification not found" });
      }
      
      return res.status(200).send({ message: "Notification deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}