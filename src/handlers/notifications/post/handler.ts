// src/handlers/notifications/post/handler.ts
import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { Operations } from "@/libs/enums/common";
import { BadRequestExecption } from "@/libs/error/error";
import { NotificationService } from "@/libs/services/notifications/service";
import { ApiRequest, ApiResponse, IHandler } from "@/libs/types/common";
import { OPERATION_IDS } from "@/libs/constants/operation-ids";
import { 
  CreateNotificationHandlerInput, 
  createNotificationSchema 
} from "../types";

export class CreateNotificationHandler implements IHandler {
  operation: Operations;
  isIdempotent: boolean;
  operationId: string;
  resource: string;
  validations: any[];
  notificationService: NotificationService;
  isAuthorizedAccess?: boolean;
  
  constructor() {
    this.operation = Operations.CREATE;
    this.isIdempotent = false;
    this.isAuthorizedAccess = true;
    this.operationId = OPERATION_IDS.NOTIFICATIONS.CREATE_NOTIFICATION;
    this.resource = HTTP_RESOURCES.NOTIFICATIONS.CREATE_NOTIFICATION;
    this.validations = [];
    this.notificationService = new NotificationService();
    this.handler = this.handler.bind(this);
  }

  async handler(
    req: ApiRequest<CreateNotificationHandlerInput>,
    res: ApiResponse,
    next
  ) {
    try {
      const { userInfo } = req;
      
      if (!userInfo || !userInfo.id) {
        throw new BadRequestExecption("User information is required");
      }
      
      const data = createNotificationSchema.parse(req.body);
      
      const notification = await this.notificationService.createNotification({
        userId: userInfo.id,
        ...data
      } as any);
      
      return res.status(201).send(notification);
    } catch (error) {
      next(error);
    }
  }
}