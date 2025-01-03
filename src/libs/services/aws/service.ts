import { AWS_CONFIG } from "@/libs/constants/common";
import { S3 } from "@aws-sdk/client-s3";
import { SQS } from "@aws-sdk/client-sqs";

export class AwsService {
  private static s3Cient: S3;
  private static sqsClient: any;

  static getS3Client({ region }: { region?: string } = {}) {
    if (!AwsService.s3Cient) {
      AwsService.s3Cient = new S3({ region: region || AWS_CONFIG.region });
    }
    return AwsService.s3Cient;
  }

  static getSQSClient() {
    if (!AwsService.sqsClient) {
      AwsService.sqsClient = new SQS({ region: AWS_CONFIG.region });
    }
    return AwsService.sqsClient;
  }
}
