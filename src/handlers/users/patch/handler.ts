import { NextFunction, Request, Response } from "express";
import { ApiRequest, IHandler } from "@/libs/types/common";
import { Operations } from "@/libs/enums/common";
import { Users } from "@/libs/services/mongo/models/user";
import { OPERATION_IDS } from "@/libs/constants/operation-ids";
import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { SqsService } from "@/libs/services/sqs/service";
import { env } from "@/env/env";
import { z } from "zod";
import { SQS_QUEUES } from "@/libs/constants/sqs";

const baseVendorRegistrationSchema = z.object({
    profession: z.string(),
    attachment: z.any().optional(),
    vendorPhoto: z.any(),
    businessName: z.string().min(1, "Business name is required"),
    name: z.string().min(1, "Full name is required"),
    email: z.string().email({ message: "Enter a valid email format" }).optional(),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    alternatePhone: z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .optional(),
    shopOwnerName: z.string().min(1, "Shop owner name is required"),
    vendorType: z.enum(["Proprietor", "Partner", "Director", "Individual"]),
    shopAddress: z.string().min(1, "Shop address is required"),
    pincode: z
        .string()
        .min(6, "Pincode must be at least 6 digits")
        .regex(/^\d+$/, "Pincode must contain only numbers"),
    branchName: z.string().min(1, "Branch name is required").optional(),
    aadhaarNumber: z
        .string()
        .length(12, "Aadhaar number must be 12 digits")
        .optional(),
    bankAccountName: z
        .string()
        .min(1, "Bank account name is required")
        .optional(),
    bankName: z.string().optional(),
    upiId: z
        .string()
        .regex(/^[\w.-]+@[\w.-]+$/, "Invalid UPI ID")
        .optional(),
    accountNumber: z
        .string()
        .regex(/^\d+$/, "Account number must contain only digits")
        .min(1, "Account number is required")
        .max(18, "Account number must not exceed 18 digits")
        .optional(),
    ifscCode: z
        .string()
        .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code")
        .optional(),
});

export type VendorRegistrationRequestType = z.infer<
    typeof vendorRegistrationRequestSchema
>;

export type VendorOnboardingDataType =
    VendorRegistrationRequestType["onboardingData"];

export const vendorRegistrationRequestSchema = z.object({
    phoneNumber: z.string(),
    onboardingData: baseVendorRegistrationSchema,
});

const VENDOR_INFO_FIELDS = [
    'name',
    'phoneNumber',
    'shopOwnerName',
    'vendorType',
    'branchName',
    'bankAccountName',
    'bankName',
    'upiId',
    'accountNumber',
    'ifscCode'
] as const;
export function transformVendorData(flattenedUser: any): VendorOnboardingDataType {
    const transformedData: VendorOnboardingDataType = {
        profession: flattenedUser.profession || "",
        businessName: flattenedUser.businessName || flattenedUser.vendorName || "",
        name: flattenedUser.name || flattenedUser.fullNameAsPerAadhaar || "",
        email: flattenedUser.email || "",
        phoneNumber: flattenedUser.phoneNumber || "",
        alternatePhone: flattenedUser.alternatePhone || "",
        shopOwnerName: flattenedUser.shopOwnerName || "",
        vendorType: flattenedUser.vendorType || "Individual",
        shopAddress: flattenedUser.shopAddress || flattenedUser.address || "",
        pincode: flattenedUser.pincode || "",
        branchName: flattenedUser.branchName || "",
        aadhaarNumber: flattenedUser.aadhaarNumber || "",
        bankAccountName: flattenedUser.bankAccountName || "",
        bankName: flattenedUser.bankName || "",
        upiId: flattenedUser.upiId || "",
        accountNumber: flattenedUser.accountNumber || "",
        ifscCode: flattenedUser.ifscCode || "",
    };

    return transformedData;
}
export class PatchUserHandler implements IHandler {
    public operation: Operations;
    public isIdempotent: boolean;
    public operationId: string;
    public resource: string;
    public validations: any[];
    public isAuthorizedAccess: boolean;
    private sqsService: SqsService;

    constructor() {
        this.operation = Operations.UPDATE;
        this.isIdempotent = true;
        this.operationId = OPERATION_IDS.USER.PATCH_USER;
        this.resource = HTTP_RESOURCES.USER;
        this.validations = [];
        this.isAuthorizedAccess = true;
        this.sqsService = new SqsService();

        // Bind methods
        this.handler = this.handler.bind(this);
        this.isVendorInfoField = this.isVendorInfoField.bind(this);
        this.publishVendorInfoUpdateRequestEvent = this.publishVendorInfoUpdateRequestEvent.bind(this);
        this.updateVendorInfo = this.updateVendorInfo.bind(this);
    }

    private isVendorInfoField(field: string): boolean {
        return VENDOR_INFO_FIELDS.includes(field as any);
    }

    private async publishVendorInfoUpdateRequestEvent({
        vendorInfo,
        vendorId,
    }: {
        vendorInfo: any;
        vendorId: string;
    }) {
        if (!vendorInfo || !vendorId) {
            throw new Error("Vendor info and vendorId are required");
        }

        const transformedData = transformVendorData(vendorInfo);

        const response = await this.sqsService.sendMessage({
            message: {
                eventId: "vendor-generic-event",
                subEvent: "vendor-account-update-request",
                tenantId: env.ORG_ID,
                vendorId,
                eventDetails: transformedData,
            },
            queueUrl: SQS_QUEUES.RAISE_INVOICE_REQUEST_QUEUE.url
        });

        console.log("SQS vendor update event published:", { vendorId, response });
        return response;
    }

    private async updateVendorInfo(user: any, data: any) {
        if (data.vendorInfo) {
            return {
                ...user.vendorInfo?.toObject() || {},
                ...data.vendorInfo
            };
        }

        const vendorInfoUpdates: any = {};
        const otherUpdates: any = {};

        Object.entries(data).forEach(([key, value]) => {
            if (this.isVendorInfoField(key)) {
                vendorInfoUpdates[key] = value;
            } else {
                otherUpdates[key] = value;
            }
        });

        if (Object.keys(vendorInfoUpdates).length > 0) {
            const currentVendorInfo = user.vendorInfo?.toObject() || {};
            return {
                ...currentVendorInfo,
                ...vendorInfoUpdates
            };
        }

        return user.vendorInfo?.toObject() || {};
    }

    public async handler(
        req: ApiRequest,
        res: Response,
        next: NextFunction
    ): Promise<Response> {
        try {
            const { vendorId, data } = req.body as any;

            if (!vendorId) {
                return res.status(400).json({ message: "Vendor ID is required" });
            }

            const user = await Users.findOne({ vendorId });

            if (!user) {
                return res.status(404).json({ message: "Vendor not found" });
            }

            // Update vendor info
            const updatedVendorInfo = await this.updateVendorInfo(user, data);
            const updateData = { ...data, vendorInfo: updatedVendorInfo };

            // Update user document
            const updatedUser = await Users.findOneAndUpdate(
                { vendorId },
                { $set: updateData },
                {
                    new: true,
                    runValidators: true,
                    context: 'query'
                }
            );

            if (!updatedUser) {
                return res.status(404).json({ message: "Failed to update vendor" });
            }

            // Publish update event
            await this.publishVendorInfoUpdateRequestEvent({
                vendorInfo: {
                    ...updatedUser.toObject(),
                    ...updatedVendorInfo,
                },
                vendorId,
            });

            return res.status(200).json(updatedUser);
        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'ValidationError') {
                    return res.status(400).json({
                        message: "Validation error",
                        errors: error.message
                    });
                }
                console.error("Error updating vendor:", error);
                return res.status(500).json({
                    message: "Internal server error",
                    error: error.message
                });
            }
            next(error);
        }
    }
}