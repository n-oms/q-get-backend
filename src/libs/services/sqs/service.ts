import { SQS } from "@aws-sdk/client-sqs";
import { SendMessageInput } from "./types";
import { AWS_CONFIG } from "@/libs/constants/common";

export class SqsService {
  private readonly sqs: SQS;
  constructor() {
    this.sqs = new SQS({ region: AWS_CONFIG.region });
    this.sendMessage = this.sendMessage.bind(this);
  }

  async sendMessage(input: SendMessageInput) {
    try {
      const response = await this.sqs.sendMessage({
        QueueUrl: input.queueUrl,
        MessageBody: JSON.stringify(input.messageBody),
      });
      if (response.$metadata.httpStatusCode !== 200) {
        throw new Error("Failed to send message to SQS");
      }
      return response;
    } catch (error) {
        throw new Error("Failed to send message to SQS");
    }
  }
}
