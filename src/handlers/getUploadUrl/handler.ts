import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { Operations } from "@/libs/enums/common";
import { IHandler } from "@/libs/types/common";
import { NextFunction, Request, Response } from "express";
import { getUploadUrlSchema } from "./validation";
import { S3Service } from "@/libs/services/s3/service";
import { AWS_CONFIG } from "@/libs/constants/common";

export class GetUploadUrlHandler implements IHandler {
  operation: Operations;
  isIdempotent: boolean;
  operationId: string;
  resource: string;
  validations: any[];
  isAuthorizedAccess: boolean;
  s3Service: S3Service;
  constructor() {
    this.operation = Operations.CREATE;
    this.isIdempotent = true;
    this.operationId = "GET_UPLOAD_URL";
    this.resource = HTTP_RESOURCES.GET_UPLOAD_URL;
    this.validations = [];
    this.isAuthorizedAccess = true;
    this.handler = this.handler.bind(this);
    this.s3Service = new S3Service();
  }

  public async handler(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileType, s3Key } = getUploadUrlSchema.parse(req.body);
      const url = await this.s3Service.getPresignedUploadUrl({
        fileType,
        key: s3Key,
        bucket: AWS_CONFIG.s3.bucketName,
      });
      return res.status(200).json(url);
    } catch (error) {
      next(error);
    }
  }
}
