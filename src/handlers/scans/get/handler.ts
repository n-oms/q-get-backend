import { OPERATION_IDS } from "@/libs/constants/operation-ids";
import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { Operations } from "@/libs/enums/common";
import { BadRequestExecption } from "@/libs/error/error";
import { UserType } from "@/libs/services/mongo/enums";
import { Scans } from "@/libs/services/mongo/models/scans";
import { ApiRequest, ApiResponse, IHandler } from "@/libs/types/common";

export class GetScanHandler implements IHandler {
    operation: Operations;
    isIdempotent: boolean;
    operationId: string;
    resource: string;
    validations: any[];
    isAuthorizedAccess?: boolean;
    constructor() {
        this.operation = Operations.READ;
        this.isIdempotent = true;
        this.operationId = OPERATION_IDS.SCANS.GET_SCANS;
        this.resource = HTTP_RESOURCES.SCANS;
        this.isAuthorizedAccess = true
        this.validations = [];
    }

    public async handler(req: ApiRequest, res: ApiResponse, next) {
        const userInfo = req.userInfo
        try {
            if (userInfo.userType !== UserType.Vendor || !userInfo.vendorId) {
                throw new BadRequestExecption("User is not authorized to access this resource")
            }
            const userScans = await Scans.find({ vendorId: userInfo.vendorId })
            return res.status(200).json(userScans);
        } catch (error) {
            next(error)
        }
    }
}