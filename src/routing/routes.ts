import { OtpApiHandler } from "@/handlers";
import { APP_CONSTANTS, HTTP_METHODS } from "@/libs/constants/common";
import { Operations } from "@/libs/enums/common";
import { errorHandler } from "@/libs/error/errorHandler";
import { IHandler } from "@/libs/types/common";
import { validate } from "@/libs/validations/api";
import { Express } from "express";

const MAP_KEY_PAIR = [
    [Operations.CREATE, HTTP_METHODS.POST], [Operations.REPLACE, HTTP_METHODS.PUT],
    [Operations.DELETE, HTTP_METHODS.DELETE], [Operations.UPDATE, HTTP_METHODS.PATCH],
    [Operations.INVOKE, HTTP_METHODS.POST], [Operations.READ, HTTP_METHODS.GET]
];
const HTTP_OPERATION_MAP = new Map(MAP_KEY_PAIR as any);
const API_VERSION = process.env.API_VERSION || APP_CONSTANTS.APP_VERSION;
export const registerRoutes = function (app: Express) {

    const routeHandlers: Array<IHandler> = getAllRouteHandlers();
    routeHandlers.forEach(element => {
        const httpMethod = HTTP_OPERATION_MAP.get(element.operation) as string;
        const relativePath = `/${API_VERSION}/${element.resource}`;
        app[httpMethod](
            relativePath,
            validate(element.validations), element.handler);
    });
    app.use(errorHandler);
    
}

function getAllRouteHandlers(): Array<IHandler> {
    const routeHandlers: Array<IHandler> = [];
    routeHandlers.push(new OtpApiHandler());
    return routeHandlers;
}