import { model, Schema, Document, Types, Mongoose } from "mongoose";

export interface IUser extends Document{
    email:string,
    password:string,
    name:string,
    status:string,
    posts: Types.Array<Types.ObjectId>
};

const userSchema = new Schema<IUser>({
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    status:{
        type: String,
        default: 'I am new'
        // required: true
    },
    posts:[{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }]
}, {
    timestamps: true,
});


const User = model<IUser>('User', userSchema);
export default User;