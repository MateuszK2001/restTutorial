import bodyParser from 'body-parser';
import express, { NextFunction, Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import feedRouter from './routes/feedRouter';
import multer, { FileFilterCallback } from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import HttpError from './Errors/HttpError';
import authRouter from './routes/authRouter';
import * as socket from './socket';

dotenv.config();

declare global {
    namespace Express {
        interface Request {
        userId?: Types.ObjectId
        }
    }
}

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const fileFilter = (req:Request, file:Express.Multer.File, cb:FileFilterCallback) => {
    const types = /jpeg|jpg|png|gif/i;
    if (types.test(file.mimetype) && types.test(path.extname(file.originalname))) {
        cb(null, true);
    } else{
        cb(null, false);  
    }
};

app.use(multer({
    storage: fileStorage, 
    fileFilter: fileFilter,
    limits: {
        fileSize: 100*1000000
    }
}).single('image'));


app.use(bodyParser.json());
app.use('/images', express.static(path.resolve('images')));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use('/feed', feedRouter)
app.use('/auth', authRouter)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(error.message);
    if (!(error instanceof HttpError))
        error = new HttpError(500, error);
    if (error instanceof HttpError) {
        const status = error.statusCode;
        const message = error.message;
        res.status(error.statusCode).json({
            message: message,
            data: error.validationErrors ? error.validationErrors : undefined
        });
    }
});

try {
    await mongoose.connect(process.env.MONGO_KEY as string, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    const server = app.listen(8000);
    const io = socket.init(server);
    io.on('connection', socket=>{
        console.log('Client connected');
        
    });
} catch (error) {
    console.log(error);
}