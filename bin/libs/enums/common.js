"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP_RESPOSE_CODES = exports.Operations = void 0;
var Operations;
(function (Operations) {
    Operations["CREATE"] = "create";
    Operations["READ"] = "read";
    Operations["REPLACE"] = "replace";
    Operations["DELETE"] = "delete";
    Operations["UPDATE"] = "update";
    Operations["INVOKE"] = "invoke";
})(Operations || (exports.Operations = Operations = {}));
var HTTP_RESPOSE_CODES;
(function (HTTP_RESPOSE_CODES) {
    HTTP_RESPOSE_CODES[HTTP_RESPOSE_CODES["CREATE"] = 201] = "CREATE";
    HTTP_RESPOSE_CODES[HTTP_RESPOSE_CODES["READ"] = 200] = "READ";
    HTTP_RESPOSE_CODES[HTTP_RESPOSE_CODES["UPDATE_SUCCESS"] = 200] = "UPDATE_SUCCESS";
    HTTP_RESPOSE_CODES[HTTP_RESPOSE_CODES["DELETE"] = 204] = "DELETE";
    HTTP_RESPOSE_CODES[HTTP_RESPOSE_CODES["DUPLICATE"] = 409] = "DUPLICATE";
    HTTP_RESPOSE_CODES[HTTP_RESPOSE_CODES["UPDATE_SUCCESS_NO_CONTENT"] = 204] = "UPDATE_SUCCESS_NO_CONTENT";
    HTTP_RESPOSE_CODES[HTTP_RESPOSE_CODES["UNKNOWN_ERROR"] = 500] = "UNKNOWN_ERROR";
    HTTP_RESPOSE_CODES[HTTP_RESPOSE_CODES["BAD_INPUT"] = 400] = "BAD_INPUT";
    HTTP_RESPOSE_CODES[HTTP_RESPOSE_CODES["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HTTP_RESPOSE_CODES[HTTP_RESPOSE_CODES["RESOURCE_NOT_FOUND"] = 404] = "RESOURCE_NOT_FOUND";
})(HTTP_RESPOSE_CODES || (exports.HTTP_RESPOSE_CODES = HTTP_RESPOSE_CODES = {}));