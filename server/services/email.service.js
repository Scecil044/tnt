import nodemailler from "nodemailer";
import { sendEmail } from "../config/email.js";
import { logger } from "../utils/winstonLogger.js";

const transport = nodemailler.createTransport({
  host:process.env.SMTP_HOST,
  port:process.env.SMTP_PASSWORD,
  auth:{
    user:process.env.SMTP_USERNAME,
    pass:process.env.SMTP_PASSWORD
  }
})

if(process.env.NODE_ENV !== "production"){
    transport
    .verify()
    .then(()=> logger.info("Connected to mail server"))
    .catch(()=>logger.warn("Unable to connect to mail server. Ensure you have the right configurations in .env"))
}

export const sendResetPasswordEmail = async (toEmail, token) => {
  try {
    let cc = [];
    let toAddress = [];
    toAddress.push(toEmail);

    const subject = "Reset Password";
    const resetLink = `${process.env.CLIENT_URL}forgot-password?q=${token}`;
    const text = `Hi, it looks like you forgot your password.<br/> 
    If you requested for the reset password link, click on the link below to reset your password <br/>
    If not, contact your system administrator or ultimately, just ignore this email<br/>
    <br/>
    <a href='${resetLink}'>Rest your Password<a/>
    <br/>
    <br/>
    <br/>
    Thanks, <br/>
    TNT support
    `;
    sendEmail(toAddress, cc, subject, text).then(async(result)=>{
        console.log(`Email sent successfully`, result)
    })
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
