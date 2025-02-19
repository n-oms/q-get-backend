import { NextFunction, Request, Response } from "express";
import { ApiRequest, IHandler } from "@/libs/types/common";
import { Operations } from "@/libs/enums/common";
import { OPERATION_IDS } from "@/libs/constants/operation-ids";
import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { Messages } from "@/libs/services/mongo/models";

export class DeleteMessageHandler implements IHandler {
    operation: Operations;
    isIdempotent: boolean;
    operationId: string;
    resource: string;
    validations: any[];
    isAuthorizedAccess: boolean;

    constructor() {
        this.operation = Operations.DELETE;
        this.isIdempotent = true;
        this.operationId = OPERATION_IDS.MESSAGES.DELETE_MESSAGES;
        this.resource = HTTP_RESOURCES.MESSAGES;
        this.validations = [];
        this.isAuthorizedAccess = true;
    }

    public async handler(
        req: ApiRequest,
        res: Response,
        next: NextFunction
    ): Promise<Response> {
        const { messageId } = req.params as any;

        try {
            if (messageId) {
                const deletedMessage = await Messages.findOneAndDelete({
                    $or: [
                        { _id: messageId },
                        { userId: messageId },
                        { senderId: messageId }
                    ]
                })
                if (!deletedMessage) {
                    return res.status(404).json({ message: "Message not found" });
                }
                return res.status(200).json({ message: "Message deleted successfully" });
            } else {
                await Messages.deleteMany({})
                return res.status(200).json({ message: "All messages deleted successfully" });
            }
        } catch (error) {
            next(error);
        }
    }
}