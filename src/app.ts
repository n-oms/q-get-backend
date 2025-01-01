import express from "express";
import { registerRoutes } from "./routing/routes";
import cors from "cors";
import pino from "pino";
import pinoHttp from "pino-http";

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

const app = express();

app.use(pinoHttp({ logger }));

app.use(cors());

app.use(express.json());

// Registering all the routes here
registerRoutes(app);

export { app };
