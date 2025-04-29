// src/handlers/notifications/get/unread-count.ts
import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { Operations } from "@/libs/enums/common";
import { NotificationService } from "@/libs/services/notifications/service";
import { ApiRequest, ApiResponse, IHandler } from "@/libs/types/common";
import { OPERATION_IDS } from "@/libs/constants/operation-ids";
import { BadRequestExecption } from "@/libs/error/error";

export class GetUnreadCountHandler implements IHandler {
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
    this.operationId = OPERATION_IDS.NOTIFICATIONS.GET_UNREAD_COUNT;
    this.resource = HTTP_RESOURCES.NOTIFICATIONS.GET_UNREAD_COUNT;
    this.validations = [];
    this.notificationService = new NotificationService();
    this.handler = this.handler.bind(this);
  }

  async handler(
    req: ApiRequest,
    res: ApiResponse,
    next
  ) {
    try {
      const { userInfo } = req;
      
      if (!userInfo || !userInfo.id) {
        throw new BadRequestExecption("User information is required");
      }
      
      const count = await this.notificationService.getUnreadCount({
        userId: userInfo.id,
      });
      
      return res.status(200).send({ count });
    } catch (error) {
      next(error);
    }
  }
}