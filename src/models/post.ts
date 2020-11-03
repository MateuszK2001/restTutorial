import { model, Schema, Document, Types } from "mongoose";

export interface IPost extends Document{
    title:string,
    imageUrl:string,
    content:string,
    creator:Types.ObjectId
};

const postSchema = new Schema<IPost>({
    title:{
        type: String,
        required: true
    },
    imageUrl:{
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true
    },
    creator:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
});


const Post = model<IPost>('Post', postSchema);
export default Post;