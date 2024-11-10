import { SQS } from "@aws-sdk/client-sqs";
import autoBind from "auto-bind";
import { SendMessageInput } from "./types";

export class SqsService {
  private readonly sqs: SQS;
  constructor() {
    this.sqs = new SQS({ region: process.env.AWS_REGION || "us-east-1" });
    autoBind(this);
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
