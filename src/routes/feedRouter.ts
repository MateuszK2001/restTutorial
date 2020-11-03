import express, { Router } from 'express';
import { deletePost, getPost, getPosts, postPost, putPost } from '../controllers/feedController';
import {body} from 'express-validator';
import {} from 'mongoose';
import isAuth from '../middleware/isAuth';

const feedRouter  = express.Router();

feedRouter.get('/posts', isAuth, getPosts);
feedRouter.post('/post', isAuth, [
    body('title')
        .trim()
        .isLength({min: 5}),
    body('content')
        .trim()
        .isLength({min: 5})
], postPost);

feedRouter.get('/post/:postId', isAuth, getPost);

feedRouter.put('/post/:postId', isAuth, [
    body('title')
        .trim()
        .isLength({min: 5}),
    body('content')
        .trim()
        .isLength({min: 5})
], putPost);

feedRouter.delete('/post/:postId', isAuth, deletePost);


export default feedRouter;