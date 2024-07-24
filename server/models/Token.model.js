import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
    type:{type:String, required:true},
    isBlackListed:{type:Boolean, default:false},
    expires:{type:Date, required:true},
    isDeleted:{type:Boolean, default:false}
},{timestamps:true})

const Token = mongoose.model("Token", TokenSchema)
export default Token