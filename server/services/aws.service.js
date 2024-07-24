import { SECRET_ID_AWS, SECRET_KEY_AWS, AWS_REGION, BUCKET_NAME } from " process.env";
import fs from "fs";
import { S3 } from "aws-sdk/clients/s3";

const s3 = new S3({
  accessKeyId: SECRET_ID_AWS,
  secretAccessKey: SECRET_KEY_AWS,
  region: AWS_REGION
});

export const uploadFilesToS3 = async (files, identifier) => {
  try {
    let urls = [];
    if (!Array.isArray(files)) {
      files = [files];
    }

    for (let file of files) {
      const fileStream = fs.createReadStream(file.tempFilePath);
      const uploadParams = {
        Bucket: BUCKET_NAME,
        Body: fileStream,
        key:`attachment_${identifier}_${Date.now()}_${file.name}/${file.name}`,
        ACL: "public-read",
        ContentType: file.mimetype
      };
      const result = await s3.upload(uploadParams).promise()
      urls.push(result.Location)
    }
    return urls
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
