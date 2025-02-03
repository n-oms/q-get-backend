import { NextFunction, Request, Response } from "express";
import { ApiRequest, IHandler } from "@/libs/types/common";
import { Operations } from "@/libs/enums/common";
import { Users } from "@/libs/services/mongo/models/user";
import { OPERATION_IDS } from "@/libs/constants/operation-ids";
import { HTTP_RESOURCES } from "@/libs/constants/resources";


export class DeleteUserHandler implements IHandler {
    operation: Operations;
    isIdempotent: boolean;
    operationId: string;
    resource: string;
    validations: any[];
    isAuthorizedAccess: boolean;

    constructor() {
        this.operation = Operations.DELETE;
        this.isIdempotent = true;
        this.operationId = OPERATION_IDS.USER.DELETE_USER;
        this.resource = HTTP_RESOURCES.USER;
        this.validations = [];
        this.isAuthorizedAccess = true;
    }

    public async handler(
        req: ApiRequest,
        res: Response,
        next: NextFunction
    ): Promise<Response> {
        const { vendorId } = req.params as any;

        if (!vendorId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        try {
            const deletedUser = await Users.findByIdAndDelete(vendorId).exec();

            if (!deletedUser) {
                return res.status(404).json({ message: "User not found" });
            }

            return res.status(200).json({ message: "User deleted successfully" });
        } catch (error) {
            next(error);
        }
    }
}