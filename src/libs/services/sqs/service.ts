import { SendMessageCommand, SQS } from "@aws-sdk/client-sqs";
import { AwsService } from "../aws/service";
import { QueuePayload } from "./types";

export class SqsService {
  private readonly sqs: SQS;
  static serviceClient: SqsService;
  constructor() {
    this.sqs = AwsService.getSQSClient()
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
      return await this.sqs.send(command);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
