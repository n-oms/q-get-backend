import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { Operations } from "@/libs/enums/common";
import { ApiRequest, ApiResponse, IHandler } from "@/libs/types/common";
import { NextFunction } from "express";
import { InvoiceApiActionType, InvoiceApiRequestType } from "./types";
import { BadRequestExecption } from "@/libs/error/error";
import { BillingService } from "@/libs/services/billing/billing.service";
import { OPERATION_IDS } from "@/libs/constants/operation-ids";

export class InvoiceApiPostHandler implements IHandler {
  operation: Operations;
  isIdempotent: boolean;
  operationId: string;
  resource: string;
  validations: any[];
  isAuthorizedAccess?: boolean;
  billingService: BillingService;
  constructor() {
    this.operation = Operations.INVOKE;
    this.isIdempotent = false;
    this.operationId = OPERATION_IDS.INVOICE.INVOICE;
    this.resource = HTTP_RESOURCES.INVOICES;
    this.validations = [];
    this.isAuthorizedAccess = true;
    this.billingService = new BillingService();
    this.handler = this.handler.bind(this);
  }

  async handler(
    req: ApiRequest<InvoiceApiRequestType>,
    res: ApiResponse,
    next: NextFunction
  ) {
    try {
      const action = req.body.action;
      if (!action) {
        throw new BadRequestExecption("Action is required");
      }
      const userInfo = req.userInfo
      let result;
      switch (action) {
        case InvoiceApiActionType.RAISE_INVOICE:
          result = await this.billingService.pushRaiseInvoiceEvent({
            vendorId: userInfo.vendorId,
          });
      }
      return res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  }
}
