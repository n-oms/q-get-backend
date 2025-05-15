import { OPERATION_IDS } from "@/libs/constants/operation-ids";
import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { Operations } from "@/libs/enums/common";
import { BadRequestExecption } from "@/libs/error/error";
import { LmsUserService } from "@/libs/services/lms-users/service";
import { IHandler } from "@/libs/types/common";
import { ClassUtils } from "@/libs/utils/classUtils";
import { NextFunction, Request, Response } from "express";

enum LmsUserManagementActions {
  SIGN_IN = "SIGN_IN",
}

export class LmsUserHandler implements IHandler {
  isAuthorizedAccess?: boolean;
  isIdempotent: boolean;
  operation: Operations;
  operationId: string;
  resource: string;
  validations: any[];
  lmsUserService: LmsUserService;
  constructor() {
    this.resource = HTTP_RESOURCES.LMS_USERS;
    this.isAuthorizedAccess = false;
    this.operation = Operations.INVOKE;
    this.operationId = OPERATION_IDS.LMS_USERS.USER_MANAGEMENT;
    this.validations = [];
    this.lmsUserService = new LmsUserService();
    ClassUtils.bindMethods(this);
  }
  async handler(req: Request, res: Response, next: NextFunction) {
    try {
      const reqBody = req.body;

      const action = reqBody.action;

      if (!action) {
        throw new BadRequestExecption("Action not provided");
      }

      let result;

      switch (action) {
        case LmsUserManagementActions.SIGN_IN: {
          result = await this.lmsUserService.signInUser(reqBody.userInfo);
          break;
        }
        default:
          throw new BadRequestExecption(`Invalid action : ${action}`);
      }
      return res.status(200).send(result);
    } catch (error) {
      console.log("Error", error);
      next(error);
    }
  }
}
