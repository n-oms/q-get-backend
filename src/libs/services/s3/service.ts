import { PutObjectCommand, S3 } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AwsService } from "../aws/service";

export class S3Service {
  private readonly s3Client: S3;
  constructor() {
    this.s3Client = AwsService.getS3Client({ region: "us-east-1" });
  }

  async getPresignedUploadUrl({
    key,
    fileType,
    bucket,
  }: {
    key: string;
    fileType: string;
    bucket: string;
  }) {
    const command = new PutObjectCommand({
      Key: key,
      Bucket: bucket,
      ContentType: fileType,
    });
    return await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    });
  }
}
