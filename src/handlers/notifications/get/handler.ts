// src/handlers/notifications/get/handler.ts
import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { Operations } from "@/libs/enums/common";
import { NotificationService } from "@/libs/services/notifications/service";
import { ApiRequest, ApiResponse, IHandler } from "@/libs/types/common";
import { GetNotificationsHandlerInput } from "../types";
import { OPERATION_IDS } from "@/libs/constants/operation-ids";
import { BadRequestExecption } from "@/libs/error/error";

export class GetNotificationsHandler implements IHandler {
  operation: Operations;
  isIdempotent: boolean;
  operationId: string;
  resource: string;
  validations: any[];
  notificationService: NotificationService;
  isAuthorizedAccess?: boolean;
  
  constructor() {
    this.operation = Operations.READ;
    this.isIdempotent = true;
    this.isAuthorizedAccess = true;
    this.operationId = OPERATION_IDS.NOTIFICATIONS.GET_NOTIFICATIONS;
    this.resource = HTTP_RESOURCES.NOTIFICATIONS.GET_NOTIFICATIONS;
    this.validations = [];
    this.notificationService = new NotificationService();
    this.handler = this.handler.bind(this);
  }

  async handler(
    req: ApiRequest<GetNotificationsHandlerInput>,
    res: ApiResponse,
    next
  ) {
    try {
      const { userInfo } = req;
      
      if (!userInfo || !userInfo.id) {
        throw new BadRequestExecption("User information is required");
      }
      
      const query = req.query || {};
      const limit = query.limit ? parseInt(query.limit as unknown as string) : 10;
      const page = query.page ? parseInt(query.page as unknown as string) : 1;
      
      const result = await this.notificationService.getNotifications({
        userId: userInfo.id,
        type: query.type as any,
        status: query.status as any,
        limit,
        page,
      });
      
      return res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  }
}