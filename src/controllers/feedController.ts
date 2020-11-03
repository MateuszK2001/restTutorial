import { RequestHandler } from "express";
import {validationResult} from 'express-validator';
import {promises as fs} from 'fs'
import { Types } from "mongoose";
import { userInfo } from "os";
import { resolve } from "path";
import HttpError from "../Errors/HttpError";
import Post, { IPost } from '../models/post';
import User from "../models/user";
import { toHttpError } from "./helper";

export const getPosts: RequestHandler = async (req, res, next) => {
  const currentPage = req.query.page?Number.parseInt(req.query.page as string) : 1;
  const perPage = 2;
  try {
    let totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate('creator')
      .skip((currentPage-1)*perPage)
      .limit(perPage);
    res.json({
      message: 'Fetched post successfully',
      totalItems: totalItems,
      posts
    });
  } catch (error) {
    return next(toHttpError(error));
  }
};

export const postPost: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return next(new HttpError(422));
  }
  if(!req.file){
    return next(new HttpError(422,undefined, "No image provided"));
  }
  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path;
  const post = new Post({
    creator: req.userId!,
    title: title,
    content: content,
    imageUrl: imageUrl
  } as IPost); 

  try {
    await post.save();
    const user = await User.findById(req.userId!);
    if(!user)
      throw new Error("User doesn't exist");
    user.posts.push(post._id);
    await user.save();
    res.status(201).json({
      post: post,
      creator:{
        _id: user._id,
        name: user.name
      }
    });
    
  } 
  catch (error) {
    return next(toHttpError(error));
  }
};
export const getPost:RequestHandler = async(req, res, next)=>{
  const postId = req.params.postId;
  try {
    const post = await Post
      .findById(postId)
      .populate('creator');
    if(!post)
      throw new HttpError(404,undefined,"Could not find post");
    return res
      .status(200)
      .json({
          message: 'Post fetched',
          post: post
      });
  } 
  catch (error) {
      return next(toHttpError(error));
  }
};

export const putPost: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return next(new HttpError(422));
  }
  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req?.file?.path ?? req.body.image as string;

  if(!imageUrl){
    return next(new HttpError(422, undefined, 'No image picked'));
  }
  
  const postId = req.params.postId;
  
  try {
    const post = await Post.findById(postId);
    if(!post || post.creator.toHexString() !== req.userId!.toHexString()){
      return next(new HttpError(403, undefined, "Post doesn't exist"));
    }
    if(imageUrl !== post.imageUrl){
      await deleteImage(post.imageUrl)
    }

    await post.updateOne({
      creator:req.userId!,
      title: title,
      content: content,
      imageUrl: imageUrl
    } as IPost); 

    res.status(200).json({
      message: 'Post updated',
      post: post,
    });
    
  } 
  catch (error) {
    return next(toHttpError(error));
  }
};
export const deletePost:RequestHandler = async (req,res,next)=>{
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if(!post || post.creator.toHexString() !== req.userId!.toHexString()){
        return next(new HttpError(403, undefined, "Post doesn't exist"));
    }
    const user = await User.findById(req.userId!);
    if(!user){
      throw new Error("User doesn't exist");
    }
    await user.posts.pull({_id: post._id});
    await user.save();
    
    await deleteImage(post.imageUrl);
    
    await post.deleteOne();

    res.status(200).json({
      message: 'Post deleted',
      post: post,
    });
    
  } catch (error) {
    return next(toHttpError(error));
  }
};
const deleteImage = async (relPath:string)=>{
  relPath = resolve(relPath);
  try {
    await fs.unlink(relPath);
  } catch (error) {
    console.log(error);
  }
}