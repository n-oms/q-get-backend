import { NextFunction, Request, Response } from "express";
import { ApiRequest, IHandler } from "@/libs/types/common";
import { Operations } from "@/libs/enums/common";
import { users } from "@/libs/services/mongo/models/user";

export class GetUserHandler implements IHandler {
    operation: Operations;
    isIdempotent: boolean;
    operationId: string;
    resource: string;
    validations: any[];
    isAuthorizedAccess: boolean;

    constructor() {
        this.operation = Operations.READ;
        this.isIdempotent = true;
        this.operationId = "getUser";
        this.resource = "getMe";
        this.validations = [];
        this.isAuthorizedAccess = true;
    }

    public async handler(req: ApiRequest, res: Response, next: NextFunction): Promise<Response> {
        const { phoneNumber } = req.userInfo;

        if (!phoneNumber) {
            return res.status(400).json({ message: "Phone number is required" });
        }

        try {
            const user = await users.findOne({ phoneNumber }).exec();

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }


            return res.status(200).json(user);
        } catch (error) {
            next(error)
        }
    }
}