"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const common_1 = require("./libs/constants/common");
const client_1 = require("./libs/services/mongo/client");
const PORT = process.env.PORT || 8000;
app_1.app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${common_1.APP_CONSTANTS.APP_NAME}:${common_1.APP_CONSTANTS.APP_VERSION} started on port ${PORT}`);
    console.log(`Environment: ${common_1.APP_CONSTANTS.NODE_ENV}`);
    console.log("Establishing database connection...");
    yield client_1.MongoDbClient.initiazeConnect();
    console.log("Database connection established");
}));
