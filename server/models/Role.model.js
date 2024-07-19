import mongoose from "mongoose"

const RoleSchema = new mongoose.Schema({
    roleName:{type:String, required:true, unique:true, enum:["user", "admin"]},
    isDeleted:{type:Boolean, default:false}
},{timestamps:true})

const Role = mongoose.model("Role", RoleSchema)
export default Role