import HttpError from "../Errors/HttpError"

export const toHttpError = (e:Error)=>{
    if(e instanceof HttpError)
        return e;
    else
        return new HttpError(500, e);
}