import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import mongoosePaginate from "mongoose-paginate-v2"
import moment from "moment";
import jwt from "jsonwebtoken"
import Token from "./Token.model.js";

const UserSchema = new mongoose.Schema(
  {
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required:true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: { type: String, },
    userName: { type: String, unique: true, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      }
    },
    profilePicture: { type: String, default: "" },
    coverPhoto: { type: String, default: "" },
    bio: { type: String, default: "" },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
    password: { type: String, minLength: 6 },
    likedPosts:[{type:mongoose.Schema.Types.ObjectId, ref:"User", default:[]}],
    isDeleted: { type: Boolean, default: false },
    firstLogin:{type:Boolean, default:true},
    role_change_log:{type:Array, default:[]}
  },
  { timestamps: true }
);

UserSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
  } catch (error) {
    return next(error);
  }
});

UserSchema.methods.comparePassword = async function(passwd) {
  return await bcrypt.compare(passwd, this.password);
};


UserSchema.methods.generateAuthTokens = async function(){
  const user = this

  const accessTokenExpires = moment().add(process.env.JWT_ACCESS_EXPIRATION_MINUTES, "minutes")
  const accessPayload = {
    _id:user._id,
    role:user.role,
    iat:moment().unix(),
    exp: accessTokenExpires.unix(),
    type:"access"
  }
  const accessToken = jwt.sign(accessPayload, process.env.JWT_SECRET)

  const refreshTokenExpires = moment().add(process.env.REFRESH_EXPIRATION_DAYS, "days")
  const refreshPayload ={
    _id:user._id,
    role:user.role,
    iat:moment().unix(),
    exp:refreshTokenExpires.unix(),
    type:"refresh"
  }
  const refreshToken = jwt.sign(refreshPayload, process.env.JWT_SECRET)

  let token ={
    isBlackListed:false,
    token:refreshToken,
    user:user._id,
    type:"refresh",
    expores:refreshTokenExpires
  }
  let createdToken = new Token(token)
  await createdToken.save()

  return{
    access:{
      token:accessToken,
      expires:accessTokenExpires.toDate()
    },
    refresh:{
      token:refreshToken,
      expires:refreshTokenExpires.toDate()

    }
  }
}


UserSchema.plugin(mongoosePaginate);
const User = mongoose.model("User", UserSchema);
export default User;
