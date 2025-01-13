import { OPERATION_IDS } from "@/libs/constants/operation-ids";
import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { Operations } from "@/libs/enums/common";
import { LeadService } from "@/libs/services/lead/service";
import {
  LeadValidationType,
  validateLead,
} from "@/libs/services/mongo/validations/sbi-lead";
import { ApiRequest, ApiResponse, IHandler } from "@/libs/types/common";

export class CreateLeadHandler implements IHandler {
  operation: Operations;
  isIdempotent: boolean;
  operationId: string;
  resource: string;
  validations: any[];
  isAuthorizedAccess: boolean;
  leadService: LeadService;

  constructor() {
    this.operation = Operations.CREATE;
    this.isIdempotent = false;
    this.isAuthorizedAccess = true;
    this.operationId = OPERATION_IDS.LEADS.CREATE_LEAD;
    this.resource = HTTP_RESOURCES.CREATE_LEAD;
    this.validations = [validateLead];
    this.handler = this.handler.bind(this);
    this.leadService = new LeadService();
  }

  async handler(
    req: ApiRequest,
    res: ApiResponse,
    next: (error?: any) => void
  ) {
    try {
      const leadData = req.body as LeadValidationType;
      const result = await this.leadService.createLead(leadData);
      return res.status(201).send(result);
    } catch (error) {
      next(error);
    }
  }
}
