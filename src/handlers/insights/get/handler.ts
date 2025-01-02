import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { Operations } from "@/libs/enums/common";
import { BadRequestExecption } from "@/libs/error/error";
import { InsightsService } from "@/libs/services/insights/service";
import { IHandler } from "@/libs/types/common";
import { ClassUtils } from "@/libs/utils/classUtils";
import { NextFunction, Request, Response } from "express";

export class GetInsightsHandler implements IHandler {
  operation: Operations;
  isIdempotent: any;
  operationId: any;
  resource: any;
  validations: any[];
  isAuthorizedAccess: any;
  insightsService: InsightsService;
  constructor() {
    this.operation = Operations.READ;
    this.isIdempotent = true;
    this.operationId = "GET_INSIGHTS";
    this.resource = HTTP_RESOURCES.INSIGHTS;
    this.validations = [];
    this.isAuthorizedAccess = false;
    this.insightsService = new InsightsService();
    ClassUtils.bindMethods(this);
  }

  public async handler(req: Request, res: Response, next: NextFunction) {
    try {
      const query = this.getQueryObject(req.query);
      const result = await this.insightsService.getInsights({
        model: req.query.entity as string,
        query,
      });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  getQueryObject(query: any) {
    if (!query.entity) {
        throw new BadRequestExecption("Entity is required");
      }
    const isSubstring = query.isSubstring === "true";
    const subStringQueryKey = query.subStringQueryKey;
    const queryObject: any = { ...query };
    if (isSubstring && subStringQueryKey) {
      const subStringQueryValue = query[subStringQueryKey];
      if (!subStringQueryValue) {
        throw new BadRequestExecption("SubStringQueryValue is required");
      }
      query[subStringQueryKey] = { $regex: subStringQueryValue, $options: "i" };
    }
    // Delete entity from query params
    delete queryObject.entity;
    delete queryObject.isSubstring;
    delete queryObject.subStringQueryKey;

    return queryObject;
  }
}
