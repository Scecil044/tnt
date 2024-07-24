import AWS from "aws-sdk";
import MailComposer from "nodemailer/lib/mail-composer/index.js";

const ses = new AWS.SES({
  accessKeyId: process.env.SECRET_ID_AWS,
  secretAccessKey: process.env.SECRET_KEY_AWS,
  region: "eu-central-1"
});

function sendEmail(toAddresses, ccAddresses, subject, body) {
  return new Promise(async (resolve, reject) => {
    try {
      const msg = {
        Source: "donotreply@gmail.com",
        Destination: {
          toAddress: toAddresses,
          CcAddress: ccAddresses
        },
        Message: {
          Body: {
            HTML: {
              Data: body,
              Charset: "UTF-8"
            }
          },
          Text: {
            Data: body,
            Charset: "UTF-8"
          },
          Subject: {
            Data: subject,
            Charset: "UTF-8"
          }
        }
      };

      ses.sendEmail(msg, async (err, data) => {
        if (err) {
          reject(err);
        } else {
          // create email log
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function sendRawEmail(toAdddresses, ccAddresses, subbject, body, attachments) {
  return Promise.resolve().then(() => {
    let mailPromise;
    const mail = new MailComposer({
      from: "",
      replyTo: "",
      to: toAdddresses,
      cc: ccAddresses,
      subject: subbject,
      html: body,
      attachments: attachments
    });
    return new Promise((resolve, reject) => {
      mail.compile().build(async (err, message) => {
        if (err) {
          reject(`Error sending email: ${err}`);
        }
        mailPromise = ses.sendRawEmail({ RawMessage: { Data: message } }).promise();
      });
      resolve(mailPromise);
    });
  });
}

export { sendEmail, sendRawEmail };
