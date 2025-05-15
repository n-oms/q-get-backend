import { OtpApiHandler } from "@/handlers";
import { APP_CONSTANTS, HTTP_METHODS } from "@/libs/constants/common";
import { Operations } from "@/libs/enums/common";
import { errorHandler } from "@/libs/error/errorHandler";
import { IHandler } from "@/libs/types/common";
import { validate } from "@/libs/validations/api";
import { authorizeRequest } from "@/middlewares/authorizer/authorizer";
import { Express } from "express";
import { GetScanHandler } from "@/handlers/scans";
import { CheckAuthorizationHandler } from "@/handlers/authorization";
import { InvoiceApiPostHandler } from "@/handlers/invoice";
import { MobileVersionHandler } from "@/handlers/mobile-version";
import { GetDashboardDataHandler } from "@/handlers/dashboard";
import { GetApplicationsDataHandler } from "@/handlers/applications";
import { GetCardsHandler } from "@/handlers/cards/get/handler";
import { CreateCardHandler } from "@/handlers/cards/post/handler";
import {
  GetMessagesHandler,
  SendMessageHandler,
  DeleteMessageHandler,
} from "@/handlers/messages";
import { GetFaqsHandler } from "@/handlers/faqs/get/handler";
import { BlogsPostHandler, GetBlogsHandler } from "@/handlers/blogs";
import { GetUploadUrlHandler } from "@/handlers/getUploadUrl";
import { EnquiryHandler } from "@/handlers/enquiry";
import { GetOrgInfoHandler } from "@/handlers/organization";
import { WelcomeMessagePostApiHandler } from "@/handlers/welcomeMessage";
import { PartnerRegistartionPostApiHandler } from "@/handlers/partner-registration";
import { GetInsightsHandler } from "@/handlers/insights";
import { CreateLeadHandler } from "@/handlers/sbi-lead/handler";
import {
  PatchUserHandler,
  DeleteUserHandler,
  GetAllUsersHandler,
  GetUserHandler,
  UpdateUserHandler,
} from "@/handlers/users";
// Import the handlers
import {
  GetNotificationsHandler,
  GetUnreadCountHandler,
  CreateNotificationHandler,
  MarkAllReadHandler,
  UpdateNotificationHandler,
  DeleteNotificationHandler,
} from "@/handlers/notifications";
import { LmsUserHandler } from "@/handlers/lms-users";

const MAP_KEY_PAIR = [
  [Operations.CREATE, HTTP_METHODS.POST],
  [Operations.REPLACE, HTTP_METHODS.PUT],
  [Operations.DELETE, HTTP_METHODS.DELETE],
  [Operations.UPDATE, HTTP_METHODS.PATCH],
  [Operations.INVOKE, HTTP_METHODS.POST],
  [Operations.READ, HTTP_METHODS.GET],
];
const HTTP_OPERATION_MAP = new Map(MAP_KEY_PAIR as any);
const API_VERSION = process.env.API_VERSION || APP_CONSTANTS.APP_VERSION;
export const registerRoutes = function (app: Express) {
  const routeHandlers: Array<IHandler> = getAllRouteHandlers();
  routeHandlers.forEach((element) => {
    const httpMethod = HTTP_OPERATION_MAP.get(element.operation) as string;
    const relativePath = `/${API_VERSION}/${element.resource}`;
    app[httpMethod](
      relativePath,
      element.isAuthorizedAccess
        ? authorizeRequest
        : (req, res, next) => next(),
      validate(element.validations),
      element.handler
    );
  });
  app.use(errorHandler);
};

function getAllRouteHandlers(): Array<IHandler> {
  const routeHandlers: Array<IHandler> = [];
  routeHandlers.push(new GetDashboardDataHandler());
  routeHandlers.push(new GetApplicationsDataHandler());
  routeHandlers.push(new GetUserHandler());
  routeHandlers.push(new OtpApiHandler());
  routeHandlers.push(new MobileVersionHandler());
  routeHandlers.push(new CheckAuthorizationHandler());
  routeHandlers.push(new InvoiceApiPostHandler());
  routeHandlers.push(new GetScanHandler());
  routeHandlers.push(new GetCardsHandler());
  routeHandlers.push(new CreateCardHandler());
  routeHandlers.push(new GetMessagesHandler());
  routeHandlers.push(new SendMessageHandler());
  routeHandlers.push(new GetFaqsHandler());
  routeHandlers.push(new GetBlogsHandler());
  routeHandlers.push(new BlogsPostHandler());
  routeHandlers.push(new GetUploadUrlHandler());
  routeHandlers.push(new EnquiryHandler());
  routeHandlers.push(new GetOrgInfoHandler());
  routeHandlers.push(new WelcomeMessagePostApiHandler());
  routeHandlers.push(new PartnerRegistartionPostApiHandler());
  routeHandlers.push(new GetInsightsHandler());
  routeHandlers.push(new CreateLeadHandler());
  routeHandlers.push(new PatchUserHandler());
  routeHandlers.push(new DeleteUserHandler());
  routeHandlers.push(new GetAllUsersHandler());
  routeHandlers.push(new UpdateUserHandler());
  routeHandlers.push(new DeleteMessageHandler());
  routeHandlers.push(new GetNotificationsHandler());
  routeHandlers.push(new GetUnreadCountHandler());
  routeHandlers.push(new CreateNotificationHandler());
  routeHandlers.push(new MarkAllReadHandler());
  routeHandlers.push(new UpdateNotificationHandler());
  routeHandlers.push(new DeleteNotificationHandler());
  routeHandlers.push(new LmsUserHandler());
  return routeHandlers;
}
