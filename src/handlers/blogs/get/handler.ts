import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { Operations } from "@/libs/enums/common";
import { BlogsModel } from "@/libs/services/mongo/models/blog";
import { IHandler } from "@/libs/types/common";

export class GetBlogsHandler implements IHandler {
    operation: Operations;
    isIdempotent: boolean;
    operationId: string;
    resource: string;
    validations: any[];
    isAuthorizedAccess: boolean;

    constructor() {
        this.operation = Operations.READ;
        this.isIdempotent = true;
        this.operationId = "GET_BLOGS";
        this.resource = HTTP_RESOURCES.BLOGS;
        this.validations = [];
        this.isAuthorizedAccess = false;
        this.handler = this.handler.bind(this);
    }

    public async handler(_: any, res: any): Promise<any> {
        const blogs = await BlogsModel.find({}).exec()
        return res.status(200).json(blogs);
    }
}