import { OPERATION_IDS } from "@/libs/constants/operation-ids";
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
    this.operationId = OPERATION_IDS.MESSAGES.GET_MESSAGES;
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

      const query: any = {
        userId: userInfo.id || userInfo.phoneNumber,
      };

      // Add all query parameters to the query object
      Object.entries(req.query).forEach(([key, value]) => {
        if (key === 'createdAt') {
          const [day, month, year] = (value as string).split('/');
          // Create start and end of the day for exact date matching
          const startDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
          const endDate = new Date(`${year}-${month}-${day}T23:59:59.999Z`);
          query[key] = {
            $gte: startDate,
            $lte: endDate
          };
        } else {
          query[key] = value;
        }
      });

      const userMessages = await Messages.find(query);
      return res.status(200).json(userMessages);
    } catch (error) {
      next(error);
    }
  }
}
