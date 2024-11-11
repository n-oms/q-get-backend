import { env } from "@/env/env";
import { AWS_CONFIG } from "./common";

export const constructSqsQueueUrl = (queueName: string): string => {
  return `https://sqs.${AWS_CONFIG.region}.amazonaws.com/${AWS_CONFIG.accountId}/${queueName}`;
};

export const SQS_QUEUES = {
  RAISE_INVOICE_REQUEST_QUEUE: {
    url: constructSqsQueueUrl(env.RAISE_INVOICE_SQS_QUEUE_NAME),
  },
};
