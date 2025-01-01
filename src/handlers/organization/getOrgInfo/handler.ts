import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { Operations } from "@/libs/enums/common";
import { OrganizationService } from "@/libs/services/organization/service";
import { IHandler } from "@/libs/types/common";
import { ClassUtils } from "@/libs/utils/classUtils";
import { NextFunction, Request, Response } from "express";

export class GetOrgInfoHandler implements IHandler {
    operation: Operations;
    isIdempotent: boolean;
    operationId: string;
    resource: string;
    validations: any[];
    isAuthorizedAccess: boolean;
    organizationService: OrganizationService
    constructor() {
        this.operation = Operations.READ;
        this.isIdempotent = true;
        this.operationId = "GET_ORG_INFO";
        this.resource = HTTP_RESOURCES.ORGANIZATION.GET_ORG_INFO;
        this.validations = [];
        this.isAuthorizedAccess = false;
        this.organizationService = new OrganizationService()
        ClassUtils.bindMethods(this)
    }
    
    public async handler(_:Request, res: Response, next: NextFunction) {
        try {
            const orgInfo = await this.organizationService.getOrganizationInfo()
            return res.status(200).json(orgInfo)
        } catch (error) {
            next(error)
        }
    }
}