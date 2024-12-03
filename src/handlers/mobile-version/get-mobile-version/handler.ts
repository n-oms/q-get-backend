import { Request, Response } from 'express';
import { IHandler } from '@/libs/types/common'; 
import { Operations } from '@/libs/enums/common'; 
import { HTTP_RESOURCES } from '@/libs/constants/common'; 
import { OPERATION_IDS } from '@/libs/constants/operation-ids';

export class MobileVersionHandler implements IHandler {
    operation: Operations;
    isIdempotent: boolean;
    operationId: string;
    resource: string;
    validations: any[];
    isAuthorizedAccess: boolean;

    constructor() {
        this.operation = Operations.READ; 
        this.isIdempotent = true; 
        this.operationId = OPERATION_IDS.MOBILE_VERSION.GET_MOBILE_VERSION; 
        this.resource = HTTP_RESOURCES.MOBILE_VERSION; 
        this.validations = []; 
        this.isAuthorizedAccess =true;
    }

    public async handler(req: Request, res: Response): Promise<Response> {
        const androidAppVersion = '1.0.0';  
        const iosAppVersion = '1.0.0';      

        return res.status(200).json({
            androidAppVersion,
            iosAppVersion,
        });
    }
}
