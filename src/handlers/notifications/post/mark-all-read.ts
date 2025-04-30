// src/handlers/notifications/post/mark-all-read.ts
import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { Operations } from "@/libs/enums/common";
import { BadRequestExecption } from "@/libs/error/error";
import { NotificationService } from "@/libs/services/notifications/service";
import { ApiRequest, ApiResponse, IHandler } from "@/libs/types/common";
import { OPERATION_IDS } from "@/libs/constants/operation-ids";
import { 
  MarkAllReadHandlerInput, 
  NotificationHandlerActions, 
  markAllReadSchema 
} from "../types";

export class MarkAllReadHandler implements IHandler {
  operation: Operations;
  isIdempotent: boolean;
  operationId: string;
  resource: string;
  validations: any[];
  notificationService: NotificationService;
  isAuthorizedAccess?: boolean;
  
  constructor() {
    this.operation = Operations.UPDATE;
    this.isIdempotent = true;
    this.isAuthorizedAccess = true;
    this.operationId = OPERATION_IDS.NOTIFICATIONS.MARK_ALL_READ;
    this.resource = HTTP_RESOURCES.NOTIFICATIONS.MARK_ALL_READ;
    this.validations = [];
    this.notificationService = new NotificationService();
    this.handler = this.handler.bind(this);
  }

  async handler(
    req: ApiRequest<MarkAllReadHandlerInput>,
    res: ApiResponse,
    next
  ) {
    try {
      const { userInfo } = req;
      
      if (!userInfo || !userInfo.id) {
        throw new BadRequestExecption("User information is required");
      }
      
      const data = markAllReadSchema.parse(req.body);
      
      if (data.action !== NotificationHandlerActions.MARK_ALL_READ) {
        throw new BadRequestExecption("Invalid action");
      }
      
      const count = await this.notificationService.markAllAsRead({
        userId: userInfo.id,
      });
      
      return res.status(200).send({ 
        message: `${count} notifications marked as read`,
        count 
      });
    } catch (error) {
      next(error);
    }
  }
}