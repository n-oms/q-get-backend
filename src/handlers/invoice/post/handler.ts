import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { Operations } from "@/libs/enums/common";
import { ApiRequest, ApiResponse, IHandler } from "@/libs/types/common";
import { NextFunction } from "express";
import { InvoiceApiActionType, InvoiceApiRequestType } from "./types";
import { BadRequestExecption } from "@/libs/error/error";
import autoBind from "auto-bind";
import { BillingService } from "@/libs/services/billing/billing.service";

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
    this.operationId = "invoice";
    this.resource = HTTP_RESOURCES.INVOICES;
    this.validations = [];
    this.isAuthorizedAccess = true;
    this.billingService = new BillingService();
    autoBind(this);
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
      let result;
      switch (action) {
        case InvoiceApiActionType.RAISE_INVOICE:
          result = await this.billingService.pushRaiseInvoiceEvent({
            vendorId: req.body.data.vendorId,
          });
      }
      return res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  }
}
