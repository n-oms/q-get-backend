import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { Operations } from "@/libs/enums/common";
import { Messages } from "@/libs/services/mongo/models/messages";
import { ApiResponse, IHandler } from "@/libs/types/common";
import { SqsService } from "@/libs/services/sqs/service";
import { GetMessageInput } from "@/handlers/applications/types";
import { SQS_QUEUES } from "@/libs/constants/sqs";
import { OPERATION_IDS } from "@/libs/constants/operation-ids";

export class SendMessageHandler implements IHandler {
  operation: Operations;
  isIdempotent: boolean;
  operationId: string;
  resource: string;
  validations: any[];
  isAuthorizedAccess?: boolean;
  private sqsService: SqsService;

  constructor() {
    this.operation = Operations.CREATE;
    this.isIdempotent = false;
    this.operationId = OPERATION_IDS.MESSAGES.SEND_MESSAGES;
    this.resource = HTTP_RESOURCES.MESSAGES;
    this.isAuthorizedAccess = true;
    this.validations = [];
    this.sqsService = new SqsService();
    this.handler = this.handler.bind(this);
  }

  public async handler(req: GetMessageInput, res: ApiResponse, next) {
    const userInfo = req.userInfo;
    try {
      const message = req.body.message;

      // Send message to SQS
      const messageResponse = await this.sqsService.sendMessage({
        message: {
          ...message,
          tenantId: process.env.ORG_ID,
        },
        queueUrl: SQS_QUEUES.MESSAGE_QUEUE_URL.url,
      });

      // Save message to database
      const messageEntry = await Messages.create({
        ...message,
        userId: userInfo.id || userInfo.phoneNumber,
      });

      return res.status(200).json({
        messageResponse,
        messageEntry,
      });
    } catch (error) {
      next(error);
    }
  }
}
