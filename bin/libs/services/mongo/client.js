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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDbClient = void 0;
const env_1 = require("../../../env/env");
const error_1 = require("../../../libs/error/error");
const mongoose_1 = __importDefault(require("mongoose"));
class MongoDbClient {
    static initiazeConnect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dbUrl = env_1.env.MONGO_DB_URL;
                if (!dbUrl) {
                    throw new error_1.EnvNotFoundError("MONGO_DB_URL not found in env");
                }
                // Establishing connection only if connection is not already established
                if (mongoose_1.default.connection.readyState !== 1) {
                    yield mongoose_1.default.connect(env_1.env.MONGO_DB_URL);
                }
            }
            catch (error) {
                console.error(error);
                throw new error_1.ConnectionError("Error connecting to mongo db");
            }
        });
    }
}
exports.MongoDbClient = MongoDbClient;