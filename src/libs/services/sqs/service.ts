import { SendMessageCommand, SQS } from "@aws-sdk/client-sqs";
import { QueuePayload, SendMessageInput } from "./types";
import { AWS_CONFIG } from "@/libs/constants/common";

export class SqsService {
  private readonly sqs: SQS;
  static serviceClient: SqsService;
  constructor() {
    this.sqs = new SQS({ region: AWS_CONFIG.region });
    this.sendMessage = this.sendMessage.bind(this);
  }
  static getServiceClient(): SqsService {
    if (!SqsService.serviceClient) {
      SqsService.serviceClient = new SqsService();
    }
    return SqsService.serviceClient;
  }

  async sendMessage({ message, queueUrl }: QueuePayload) {
    try {
      const command = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(message),
      });
      return this.sqs.send(command);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
