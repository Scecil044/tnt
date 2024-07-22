import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import mongoosePaginate from "mongoose-paginate-v2";

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
    isDeleted: { type: Boolean, default: false }
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

UserSchema.plugin(mongoosePaginate);
const User = mongoose.model("User", UserSchema);
export default User;
