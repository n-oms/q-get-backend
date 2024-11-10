
export const APP_CONSTANTS = {
    APP_NAME: 'QGET backend',
    APP_VERSION: 'v1',
    DEV: 'dev',
    STAGING: 'staging',
    PROD: 'prod',
    TIMEZONE: 'Asia/Kolkata',
    NODE_ENV: process.env.NODE_ENV || 'dev',
  };
  

export const HTTP_METHODS = {
    PUT: 'put',
    POST: 'post',
    DELETE: 'delete',
    PATCH: 'patch',
    GET: 'get',
  };
  
  export const OPERATIONS = {
    CREATE: 'create',
    READ: 'read',
    REPLACE: 'replace',
    DELETE: 'delete',
    UPDATE: 'update',
    INVOKE: 'invoke',
  };
  export const HTTP_RESOURCES = {
    MOBILE_VERSION: 'mobile-version',
  };
  

  export const SQS_EVENT_IDS = {
    RAISE_INVOICE_REQUEST: 'raise-invoice-request',
  }