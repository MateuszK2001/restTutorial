import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { toHttpError } from '../controllers/helper';
import HttpError from '../Errors/HttpError';


const isAuth:RequestHandler = (req,res,next)=>{
    const authorizationHeader = req.get('Authorization');
    let decodedToken:any;
    try {
        if(!authorizationHeader)
            throw new HttpError(401);
        const token = authorizationHeader.split(' ')[1];
        decodedToken = jwt.verify(token, process.env.JWT_TOKEN as string) as any;
        if(!decodedToken)
            throw new HttpError(401);
            
        req.userId = Types.ObjectId(decodedToken.userId);

        next();
    } catch (error) {
        throw toHttpError(error);
    }
}

export default isAuth;