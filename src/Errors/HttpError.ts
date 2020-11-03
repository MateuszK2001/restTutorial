import { ValidationError } from "express-validator";

type ErrorCode = 401|403|404|422|500;
const ErrorMessages:Record<ErrorCode, string> ={
    401:"Not authenticated",
    403:"Access denied",
    404:"Not found",
    422:"Validation failed, entered data is incorrect",
    500:"Internal Server Error",
}
export default class HttpError extends Error{
    error?:Error;
    statusCode:number;
    validationErrors:ValidationError[];
    constructor(statusCode:ErrorCode, innerError?:Error, message?:string, validationErrors:ValidationError[] = []) {
        super(message ?? ErrorMessages[statusCode]);
        this.name = 'ValidationError';
        this.statusCode = statusCode;
        this.error = innerError;
        this.validationErrors = validationErrors;
    }
}