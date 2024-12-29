import { env } from "@/env/env";
import { EnquiryServiceType } from "@/libs/constants/common";
import { Operations } from "@/libs/enums/common";
import { User } from "@/libs/services/mongo/types";
import { OrganizationService } from "@/libs/services/organization/service";
import { SqsService } from "@/libs/services/sqs/service";
import { ApiRequest, IHandler } from "@/libs/types/common";
import { NextFunction, Request, Response } from "express";
import { sendEnquiryBodySchema } from "./validation";
import { EnquiryService } from "@/libs/services/enquiry/service";
import { HTTP_RESOURCES } from "@/libs/constants/resources";

export class EnquiryHandler implements IHandler {
  operation: Operations;
  isIdempotent: boolean;
  operationId: string;
  resource: string;
  validations: any[];
  isAuthorizedAccess: boolean;
  sqsService: SqsService;
  organizationService: OrganizationService;
  enquiryService: EnquiryService;

  constructor() {
    this.operation = Operations.INVOKE;
    this.isIdempotent = true;
    this.operationId = "GET_ENQUIRY";
    this.resource = HTTP_RESOURCES.ENQUIRY;
    this.validations = [];
    this.isAuthorizedAccess = true;
    this.handler = this.handler.bind(this);
    this.sqsService = new SqsService();
    this.organizationService = new OrganizationService();
    this.enquiryService = new EnquiryService();
  }

  public async handler(req: ApiRequest, res: Response, next: NextFunction) {
    try {
      const userInfo = req.userInfo;

      const body = sendEnquiryBodySchema.parse(req.body);

      const result = await this.enquiryService.sendEnquiry({
        enquiryServiceType: body.enquiryServiceType,
        userInfo,
        data: body,
      });

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
