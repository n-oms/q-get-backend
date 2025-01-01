import { Operations } from "@/libs/enums/common";
import { FaqModel, Faqs } from "@/libs/services/mongo/models/faq";
import { IHandler } from "@/libs/types/common";
import { Request, Response } from "express";

export class GetFaqsHandler implements IHandler {
    operation: Operations;
    isIdempotent: boolean;
    operationId: string;
    resource: string;
    validations: any[];
    isAuthorizedAccess: boolean;
    
    constructor() {
        this.operation = Operations.READ;
        this.isIdempotent = true;
        this.operationId = "GET_FAQS";
        this.resource = "faqs";
        this.validations = [];
        this.isAuthorizedAccess = false;
        this.handler = this.handler.bind(this);
    }
    
    public async handler(_: Request, res: Response): Promise<any> {
        const faqs = await FaqModel.find({}).exec()
        return res.status(200).json(faqs);
    }
} 