import { ZodError } from "zod";
import { Exceptions } from "../enums/errors";

export const errorHandler = (err, req, res, next) => {
  let statusCode;
  let message;
  if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = err.errors;
  } else {
    statusCode = 500;
    message = Exceptions.UNKNOWN_HANDLED_ERROR;
  }
  res.status(statusCode).send({ message });
};
