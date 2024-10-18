"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../enums/errors");
const errorHandler = (err, req, res, next) => {
    console.log("Error", err);
    res.status(err.statusCode ? err.statusCode : 500).send({ message: err.message || errors_1.Exceptions.UNKNOWN_HANDLED_ERROR });
};
exports.errorHandler = errorHandler;
