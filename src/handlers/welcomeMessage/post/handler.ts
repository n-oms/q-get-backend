import { HTTP_RESOURCES } from "@/libs/constants/resources";
import { Operations } from "@/libs/enums/common";
import { BadRequestExecption } from "@/libs/error/error";
import { WelcomeMessageTracker } from "@/libs/services/mongo/models/welcomeMessageTracker";
import { SmsClient } from "@/libs/services/sms/service";
import { WELCOME_MESSAGE_EXPIRATION_TIME } from "@/libs/services/sms/utils";
import { ApiRequest, IHandler } from "@/libs/types/common";
import { ClassUtils } from "@/libs/utils/classUtils";
import { NextFunction, Response } from "express";
import {
  WelcomeMessageAllowedServices,
  welcomeMessageApiSchema,
  WelcomeMessageTrackerApiActions,
} from "./validation";

export class WelcomeMessagePostApiHandler implements IHandler {
  operation: Operations;
  isIdempotent: boolean;
  operationId: string;
  resource: string;
  validations: any[];
  isAuthorizedAccess?: boolean;
  smsClient: SmsClient;
  constructor() {
    this.operation = Operations.INVOKE;
    this.isIdempotent = false;
    this.operationId = "WELCOME_MESSAGE_POST";
    this.resource = HTTP_RESOURCES.WELCOME_MESSAGE;
    this.isAuthorizedAccess = true;
    this.validations = [];
    this.handler = this.handler.bind(this);
    this.smsClient = new SmsClient();
    ClassUtils.bindMethods(this);
  }

  async handler(req: ApiRequest, res: Response, next: NextFunction) {
    try {
      const { phoneNumber } = req.userInfo;
      const body = welcomeMessageApiSchema.parse(req.body);
      let result;
      switch (body.action) {
        case WelcomeMessageTrackerApiActions.SEND_WELCOME_MESSAGE:
          {
            result = await this.sendWelcomMessage({
              phoneNumber,
              service: body.service,
            });
          }
          break;
        default:
          throw new BadRequestExecption("Invalid action");
      }

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async sendWelcomMessage({
    phoneNumber,
    service,
  }: {
    phoneNumber: string;
    service: WelcomeMessageAllowedServices;
  }) {
    try {
      
      const welcomeMessageEntry = await WelcomeMessageTracker.findOne({
        phoneNumber,
        service,
      });

      if (!welcomeMessageEntry) {
        const smsResponse = await this.smsClient.sendWelcomeMessage({
          to: phoneNumber,
        });

        if (smsResponse.ok) {
          return await WelcomeMessageTracker.create({
            phoneNumber,
            lastSentAt: Date.now(),
            service,
          });
        }
      }
      if (
        this.isLastMessageExpired({
          lastSentAt: welcomeMessageEntry.lastSentAt,
        })
      ) {
        const smsResponse = await this.smsClient.sendWelcomeMessage({
          to: phoneNumber,
        });
        console.log("SMS RESPONSE", JSON.stringify(smsResponse));
        if (smsResponse.ok) {
          return await WelcomeMessageTracker.findOneAndUpdate({
            phoneNumber,
            service,
            lastSentAt: Date.now(),
          });
        }
      }
    } catch (error) {
      console.log("Error sending welcome message", error);
    }
  }

  isLastMessageExpired({ lastSentAt }: { lastSentAt: number }) {
    if (!lastSentAt) {
      return true;
    }

    const currentTime = Date.now();
    return currentTime - lastSentAt > WELCOME_MESSAGE_EXPIRATION_TIME;
  }
}
