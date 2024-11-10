import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { Operations } from "@/libs/enums/common";
import { ApplicationsService } from "@/libs/services/applications/service";
import { ApiRequest, ApiResponse, IHandler } from "@/libs/types/common";
import { GetApplicationsHandlerInput } from "@/handlers/applications/types";

export class CheckAuthorizationHandler implements IHandler {
    operation: Operations;
    isIdempotent: boolean;
    operationId: string;
    resource: string;
    validations: any[];
    applicationsService: ApplicationsService;
    isAuthorizedAccess?: boolean;

    constructor() {
        this.operation = Operations.READ;
        this.isIdempotent = false;
        this.isAuthorizedAccess = true;
        this.operationId = "CHECK_AUTHORIZATION";
        this.resource = HTTP_RESOURCES.AUTHORIZATION.CHECK_AUTHORIZATION;
        this.validations = [];
        this.applicationsService = new ApplicationsService();
        this.handler = this.handler.bind(this);
    }

    async handler(req: ApiRequest<GetApplicationsHandlerInput>, res: ApiResponse, next) {
        try {
            const query = req.query || {};
            const result = await this.applicationsService.queryApplications({ query });
            return res.status(200).send(result);
        } 
        catch (error) {
            next(error);
            return res.status(200).send({ message: "Valid token" });
        }
    }
}
