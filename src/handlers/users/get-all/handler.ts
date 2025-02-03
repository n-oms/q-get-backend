import { NextFunction, Request, Response } from "express";
import { ApiRequest, IHandler } from "@/libs/types/common";
import { Operations } from "@/libs/enums/common";
import { Users } from "@/libs/services/mongo/models/user";
import { OPERATION_IDS } from "@/libs/constants/operation-ids";
import { HTTP_RESOURCES } from "@/libs/constants/resources";

// Get All Users Handler
export class GetAllUsersHandler implements IHandler {
  operation: Operations;
  isIdempotent: boolean;
  operationId: string;
  resource: string;
  validations: any[];
  isAuthorizedAccess: boolean;

  constructor() {
    this.operation = Operations.READ;
    this.isIdempotent = true;
    this.operationId = OPERATION_IDS.USER.GET_ALL_USERS;
    this.resource = HTTP_RESOURCES.USERS
    this.validations = [];
    this.isAuthorizedAccess = true;
  }

  public async handler(
    req: ApiRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    try {
      const users = await Users.find({}).exec();
      return res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }
}