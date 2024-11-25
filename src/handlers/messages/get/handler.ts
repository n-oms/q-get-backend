import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { Operations } from "@/libs/enums/common";
import { BadRequestExecption } from "@/libs/error/error";
import { Messages } from "@/libs/services/mongo/models";
import { ApiRequest, ApiResponse, IHandler } from "@/libs/types/common";

export class GetMessagesHandler implements IHandler {
  operation: Operations;
  isIdempotent: boolean;
  operationId: string;
  resource: string;
  validations: any[];
  isAuthorizedAccess?: boolean;

  constructor() {
    this.operation = Operations.READ;
    this.isIdempotent = true;
    this.operationId = "GET_MESSAGES";
    this.resource = HTTP_RESOURCES.MESSAGES;
    this.isAuthorizedAccess = true;
    this.validations = [];
  }

  public async handler(req: ApiRequest, res: ApiResponse, next) {
    const userInfo = req.userInfo;
    try {
      if (!userInfo.id) {
        throw new BadRequestExecption("id not provided");
      }
      if (!userInfo.phoneNumber) {
        throw new BadRequestExecption("Phone Number not provided");
      }
      const userMessages = await Messages.find({
        userId: userInfo.id || userInfo.phoneNumber,
      });
      return res.status(200).json(userMessages);
    } catch (error) {
      next(error);
    }
  }
}
