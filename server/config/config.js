import Joi from "joi";

const passwordComplexity = {
  min: 6,
  max: 30,
  lowerCase: 1,
  upperCase: 1,
  numeric: 1,
  symbol: 1
};

const validatePassword = (value, helpers) => {
  const regex = new RegExp(
    `^(?=.*[a-z]{${passwordComplexity.lowerCase},})(?=.*[A-Z]{${passwordComplexity.upperCase},})(?=.*\\d{${
      passwordComplexity.numeric
    },})(?=.*[@$!%*?&#]{${passwordComplexity.symbol},})[A-Za-z\\d@$!%*?&#]{${passwordComplexity.min},${
      passwordComplexity.max
    }}$`
  );
  if (!regex.test(value)) {
    return helpers.message(
      "Password must be between 6-30 characters, including at least 1 lowercase, 1 uppercase, 1 number, and 1 special character."
    );
  }
  return value;
};

const userSchema = Joi.object({
    password:Joi.string().custom(validatePassword).required(),
    role_change_log: Joi.array().items(Joi.string()).optional(),
    profilePicture: Joi.string().uri().optional().allow(''),
    coverPhoto: Joi.string().uri().optional().allow(''),
    bio: Joi.string().max(500).optional().allow(''),
    followers: Joi.array().items(Joi.string()).optional(),
    following: Joi.array().items(Joi.string()).optional(),
    isDeleted: Joi.boolean().optional(),
    firstLogin: Joi.boolean().optional(),
    role: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    middleName: Joi.string().optional().allow(''),
    userName: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
})

const validateUser =(user)=>{
    return userSchema.validate(user, {abortEarly:false})
}

export {validateUser}