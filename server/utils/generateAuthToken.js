import jwt from "jsonwebtoken";

export const generateAuthToken = (user, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15d" });

  res.cookie("access_token", token ,{
    httpOnly:true, // prevents xss attacks
    maxAge: 15 * 24 * 60 * 60 *1000, //ms 15 days
    sameSite: "strict",
    secure : process.NODE_ENV !== "development"
  })
};
