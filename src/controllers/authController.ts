import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import HttpError from "../Errors/HttpError";
import User, { IUser } from "../models/user";
import bcrypt from 'bcryptjs';
import { toHttpError } from "./helper";
import jwt from 'jsonwebtoken';

export const putSignup:RequestHandler = async (req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError(422, undefined, 'Validation failed', errors.array()))
    }
    const {email, name, password} = req.body as Record<string, string>;
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            email: email,
            password: hashedPassword,
            name: name,
        } as IUser);
        await user.save();
        return res.status(201).json({
            message: 'User created!',
            userId: user._id
        });
    } catch (error) {
        return next(toHttpError(error));        
    }
}

export const postLogin:RequestHandler = async (req, res, next)=>{
    const {email, password} = req.body as Record<string, string>;
    try {
        const user = await User.findOne({email: email});
        if(!user){
            throw new HttpError(401,undefined, 'Wrong email or password');
        }
        const same = await bcrypt.compare(password, user.password);
        if(!same){
            throw new HttpError(401,undefined, 'Wrong email or password');
        }
        const token = jwt.sign({
            email: user.email, 
            userId: user._id.toString()
        }, process.env.JWT_TOKEN as string,{
            expiresIn: '1h'
        });
        res
            .status(200)
            .json({
                token: token,
                userId: user._id.toString(),
            });

    } catch (error) {
        return next(toHttpError(error));
    }
}