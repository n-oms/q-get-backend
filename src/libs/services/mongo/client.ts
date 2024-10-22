import { env } from "@/env/env";
import { ConnectionError, EnvNotFoundError } from "@/libs/error/error";
import mongoose from "mongoose";

export class MongoDbClient {
    static async initiazeConnect() {
        try {
            const dbUrl = env.MONGO_DB_URL;
            console.log("db url",dbUrl);
            if (!dbUrl) {
                throw new EnvNotFoundError("MONGO_DB_URL not found in env");
            }
            // Establishing connection only if connection is not already established
            if (mongoose.connection.readyState !== 1) {
                await mongoose.connect(env.MONGO_DB_URL)
            }
        } catch (error) {
            console.error(error);
            throw new ConnectionError("Error connecting to mongo db");
        }
    }
}