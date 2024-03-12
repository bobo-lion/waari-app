const { S3, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const config = require("../config");

const s3Client = new S3({
  forcePathStyle: false, //Configures to use subdomain/virtual calling format.
  endpoint: config.endpoint,
  region: config.region,
  credentials: {
    accessKeyId: config.aws_access_key_id,
    secretAccessKey: config.aws_secret_access_key,
  },
});

const uploadObjectsToS3 = async ({ filePath, folderStructure, keyName }) => {
  console.log("filePath in uploadObjectsToS3: ", filePath);
  console.log("folderStructure in uploadObjectsToS3: ", folderStructure); //parentFolder/childFolder
  console.log("keyName  in uploadObjectsToS3: ", keyName);

  try {
    const bucketParams = {
      Bucket: config.bucketName,
      Key: `${folderStructure}/${keyName}`,
      //Body: fs.readFileSync(filePath),
      Body: fs.createReadStream(filePath),
    };

    console.log("key: ", bucketParams.Key);

    try {
      const data = await s3Client.send(new PutObjectCommand(bucketParams));
      console.log("Successfully uploaded object:   " + bucketParams.Bucket + "/" + bucketParams.Key);
      return data;
    } catch (err) {
      console.log("Error:  ", err);
    }
  } catch (err) {
    console.log("catch called in uploadObjectsToS3: ");
    if (err instanceof Error) {
      throw new Error(err.message);
    }
  }
};

module.exports = { uploadObjectsToS3 };
