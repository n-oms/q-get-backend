import { Operations } from "@/libs/enums/common";
import { IHandler } from "@/libs/types/common";
import { BlogsPostActions, blogsPostSchema } from "./schema";
import { BlogsModel } from "@/libs/services/mongo/models/blog";
import { BadRequestExecption } from "@/libs/error/error";
import { randomUUID } from "crypto";
import { HTTP_RESOURCES } from "@/libs/constants/resources";

export class BlogsPostHandler implements IHandler {
  operation: Operations;
  isIdempotent: boolean;
  operationId: string;
  resource: string;
  validations: any[];
  isAuthorizedAccess: boolean;
  bodySchema: typeof blogsPostSchema;
  constructor() {
    this.operation = Operations.CREATE;
    this.isIdempotent = false;
    this.operationId = "CREATE_BLOG";
    this.resource = HTTP_RESOURCES.BLOGS;
    this.validations = [];
    this.isAuthorizedAccess = true;
    this.handler = this.handler.bind(this);
    this.bodySchema = blogsPostSchema;
  }

  public async handler(req: any, res: any, next: any) {
    try {
      const body = this.bodySchema.parse(req.body);
      let result;
      switch (body.action) {
        case BlogsPostActions.CREATE_BLOG: {
          body.data.id = randomUUID();
          result = await BlogsModel.create(body.data);
          break;
        }
        case BlogsPostActions.UPDATE_BLOG: {
          result = await BlogsModel.updateOne({ id: body.data.id }, body.data);
        }
        default: {
          throw new BadRequestExecption("Invalid action");
        }
      }
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
