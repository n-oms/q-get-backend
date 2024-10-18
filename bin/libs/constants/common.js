"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPERATIONS = exports.HTTP_METHODS = exports.APP_CONSTANTS = void 0;
exports.APP_CONSTANTS = {
    APP_NAME: 'QGET backend',
    APP_VERSION: 'v1',
    DEV: 'dev',
    STAGING: 'staging',
    PROD: 'prod',
    TIMEZONE: 'Asia/Kolkata',
    NODE_ENV: process.env.NODE_ENV || 'dev',
};
exports.HTTP_METHODS = {
    PUT: 'put',
    POST: 'post',
    DELETE: 'delete',
    PATCH: 'patch',
    GET: 'get',
};
exports.OPERATIONS = {
    CREATE: 'create',
    READ: 'read',
    REPLACE: 'replace',
    DELETE: 'delete',
    UPDATE: 'update',
    INVOKE: 'invoke',
};
