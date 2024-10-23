import express from 'express';
import { registerRoutes } from './routing/routes';
import cors from 'cors';
import logger from "pino-http"

const app = express();

app.use(logger())

app.use(cors())

app.use(express.json());

// Registering all the routes here
registerRoutes(app)

export { app }