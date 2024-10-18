import { Exceptions } from "../enums/errors";

export const errorHandler = (err, req, res, next) => {
    console.log("Error", err)
    res.status(err.statusCode ? err.statusCode : 500).send({ message: err.message || Exceptions.UNKNOWN_HANDLED_ERROR });
};

