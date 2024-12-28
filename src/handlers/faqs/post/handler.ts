import { Operations } from "@/libs/enums/common";
import { IHandler } from "@/libs/types/common";
import { NextFunction, Request, Response } from "express";
import { FaqPostActions, postFaqsSchema } from "./schema";
import { FaqModel } from "@/libs/services/mongo/models/faq";
import { randomUUID } from "crypto";

export class FaqPostHandler implements IHandler {
  operation: Operations;
  isIdempotent: boolean;
  operationId: string;
  resource: string;
  validations: any[];
  isAuthorizedAccess: boolean;
  bodySchema: typeof postFaqsSchema;
  constructor() {
    this.operation = Operations.CREATE;
    this.isIdempotent = false;
    this.operationId = "CREATE_FAQ";
    this.resource = "faqs";
    this.validations = [];
    this.isAuthorizedAccess = true;
    this.handler = this.handler.bind(this);
    this.bodySchema = postFaqsSchema;
  }

  public async handler(req: Request, res: Response, next: NextFunction) {
    try {
      const body = this.bodySchema.parse(req.body);
      let result;
      switch (body.action) {
        case FaqPostActions.CREATE_FAQ: {
          body.data.id = randomUUID();
          result = await FaqModel.create(body.data);
          break;
        }
        case FaqPostActions.UPDATE_FAQ: {
          result = await FaqModel.updateOne({ id: body.data.id }, body.data);
          break;
        }
      }
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
