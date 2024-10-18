"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = void 0;
const handlers_1 = require("../handlers");
const common_1 = require("../libs/constants/common");
const common_2 = require("../libs/enums/common");
const errorHandler_1 = require("../libs/error/errorHandler");
const api_1 = require("../libs/validations/api");
const MAP_KEY_PAIR = [
    [common_2.Operations.CREATE, common_1.HTTP_METHODS.POST], [common_2.Operations.REPLACE, common_1.HTTP_METHODS.PUT],
    [common_2.Operations.DELETE, common_1.HTTP_METHODS.DELETE], [common_2.Operations.UPDATE, common_1.HTTP_METHODS.PATCH],
    [common_2.Operations.INVOKE, common_1.HTTP_METHODS.POST], [common_2.Operations.READ, common_1.HTTP_METHODS.GET]
];
const HTTP_OPERATION_MAP = new Map(MAP_KEY_PAIR);
const API_VERSION = process.env.API_VERSION || common_1.APP_CONSTANTS.APP_VERSION;
const registerRoutes = function (app) {
    const routeHandlers = getAllRouteHandlers();
    routeHandlers.forEach(element => {
        const httpMethod = HTTP_OPERATION_MAP.get(element.operation);
        const relativePath = `/${API_VERSION}/${element.resource}`;
        app[httpMethod](relativePath, (0, api_1.validate)(element.validations), element.handler);
    });
    app.use(errorHandler_1.errorHandler);
};
exports.registerRoutes = registerRoutes;
function getAllRouteHandlers() {
    const routeHandlers = [];
    routeHandlers.push(new handlers_1.OtpApiHandler());
    return routeHandlers;
}
