import { Operations } from "@/libs/enums/common";
import { IHandler } from "@/libs/types/common";
import {
  partnerRegistartionPostApiHandler,
  PartnerRegistrationHandlerActions,
} from "./validations";
import { NextFunction, Request, Response } from "express";
import { UserService } from "@/libs/services/user/service";
import { BadRequestExecption, ConflictException } from "@/libs/error/error";
import {
  UserStatus,
  UserType,
  VendorRegistrationStatus,
} from "@/libs/services/mongo/enums";
import { ClassUtils } from "@/libs/utils/classUtils";
import { HTTP_RESOURCES } from "@/libs/constants/resources";

export class PartnerRegistartionPostApiHandler implements IHandler {
  operation: Operations;
  isIdempotent: boolean;
  operationId: string;
  resource: string;
  validations: any[];
  isAuthorizedAccess: boolean;
  userService: UserService;
  constructor() {
    this.operation = Operations.INVOKE;
    this.isIdempotent = false;
    this.operationId = "CREATE_PARTNER_REGISTRATION";
    this.resource = HTTP_RESOURCES.PARTNER_REGISTRATION;
    this.validations = [];
    this.isAuthorizedAccess = true;
    this.userService = new UserService();
    ClassUtils.bindMethods(this);
  }

  public async handler(req: Request, res: Response, next: NextFunction) {
    try {
      const body = partnerRegistartionPostApiHandler.parse(req.body);
      switch (body.action) {
        case PartnerRegistrationHandlerActions.CREATE_PARTNER_REGISTRATION: {
          const { phoneNumber } = body.data;

          const existingUser = await this.userService.getUserByPhoneNumber({
            phoneNumber,
          });

          try {
            const {
              isVendorRegistrationRequestSent,
              vendorRegistrationStatus,
            } = existingUser;

            if (
              existingUser.status === UserStatus.VENDOR_APPROVED &&
              existingUser.vendorRegistrationStatus ===
                VendorRegistrationStatus.APPROVED
            ) {
              throw new ConflictException("Vendor already exists");
            }

            if (
              isVendorRegistrationRequestSent &&
              vendorRegistrationStatus === VendorRegistrationStatus.PENDING
            ) {
              throw new BadRequestExecption(
                "Previous registration request is pending"
              );
            }

            if (existingUser.userType === UserType.Customer) {
              const requestResponse =
                await this.userService.sendVendorRegistrationRequest({
                  vendorInfo: body.data,
                });
              if (requestResponse.$metadata.httpStatusCode === 200) {
                const user = await this.userService.updateUser({
                  phoneNumber,
                  updateData: {
                    userType: UserType.Vendor,
                    vendorRegistrationStatus: VendorRegistrationStatus.PENDING,
                    vendorId: existingUser.vendorId,
                    isVendorRegistrationRequestSent: true,
                    status: UserStatus.VENDOR_NOT_APPROVED,
                    vendorInfo: body.data,
                  },
                });
                return res.status(200).json(user);
              } else {
                throw new BadRequestExecption(
                  "Failed to send vendor registration request"
                );
              }
            }
          } catch (error) {
            throw new BadRequestExecption("User not found");
          }
          break;
        }
        default: {
            throw new BadRequestExecption("Invalid action");
        }
      }
    } catch (error) {
      next(error);
    }
  }
}
