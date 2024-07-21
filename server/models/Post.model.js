import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    text:{type:String},
    comments:[
        {
            text:{type:String, required:true},
            user:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
            isDeleted:{type:Boolean, default:false}
        }
    ],
    likes:[{type:mongoose.Types.ObjectId, ref:"User"}],
    isDeleted:{type:Boolean, default:false}
},{timestamps:true})
const Post = mongoose.model("Post", PostSchema)
export default Post