import { Request, Response } from "express";
import { Operations } from "../enums/common";

export interface IHandler {
    operation: Operations;
    isIdempotent: boolean;
    operationId: string;
    resource: string;
    handler: (validHeader, validBody, next) => void;
    validations: Array<any>;
}

export interface ApiRequestTypes {
    body?: any;
    params?: any;
    query?: any;
}  

export type ApiRequest<T extends ApiRequestTypes = {}> = Request<T['params'], any, T['body'], T['query']>
export type ApiResponse = Response
 