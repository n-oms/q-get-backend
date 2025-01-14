import { env } from "@/env/env";

export const APP_CONSTANTS = {
  APP_NAME: "QGET backend",
  APP_VERSION: "v1",
  DEV: "dev",
  STAGING: "staging",
  PROD: "prod",
  TIMEZONE: "Asia/Kolkata",
  NODE_ENV: process.env.NODE_ENV || "dev",
};

export const HTTP_METHODS = {
  PUT: "put",
  POST: "post",
  DELETE: "delete",
  PATCH: "patch",
  GET: "get",
};

export const OPERATIONS = {
  CREATE: "create",
  READ: "read",
  REPLACE: "replace",
  DELETE: "delete",
  UPDATE: "update",
  INVOKE: "invoke",
};

export const SQS_EVENT_IDS = {
  RAISE_INVOICE_REQUEST: "raise-invoice-request",
};

export const AWS_CONFIG = {
  region: env.AWS_REGION || "us-east-1",
  accountId: env.AWS_ACCOUNT_ID,
  s3: {
    bucketName: env.S3_BUCKET_NAME
  }
};

export enum EnquiryServiceType {
  INSURANCE = "INSURANCE",
  LOAN = "LOAN",
  CREDIT_CARD = "CREDIT_CARD",
  INVESTMENT = "INVESTMENT",
  OTHER = "OTHER",
}

export enum EnquiryTrigger {
  AUTOMATIC = "AUTOMATIC",
  MANUAL = "MANUAL",
}