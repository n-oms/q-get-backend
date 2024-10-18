"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionError = exports.EnvNotFoundError = exports.BadRequestExecption = void 0;
class BadRequestExecption extends Error {
    constructor(message) {
        super(message);
        this.name = 'BadRequestException';
        this.statusCode = 400;
    }
}
exports.BadRequestExecption = BadRequestExecption;
class EnvNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'EnvNotFoundError';
        this.statusCode = 500;
    }
}
exports.EnvNotFoundError = EnvNotFoundError;
class ConnectionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConnectionError';
        this.statusCode = 500; // Internal Server Error
    }
}
exports.ConnectionError = ConnectionError;
