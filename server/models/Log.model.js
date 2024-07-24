import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
    message:{type:String, required:true},
    module:{type:String, required:true},
    isDeleted:{type:Boolean, default:false}
},{timestamps:true})
const Log = mongoose.model("Log", LogSchema)
export default Log