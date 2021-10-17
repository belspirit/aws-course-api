const AWS = require("aws-sdk");
const BUCKET = "import-service-labetik-s3";
const csvParser = require("csv-parser");
const log = require("../logger");
const util = require("util");
const path = require("path");

const UPLOADED_FOLDER = "uploaded";
const PARSED_FOLDER = "parsed";

module.exports = {
  importFileParser: async function (event) {
    log.info(`importFileParser function is called with args: ${util.inspect(event)}`);
    const s3 = new AWS.S3({ region: "us-east-1" });

    for (const record of event.Records) {
      const catalogPath = record.s3.object.key; // "uploaded/fileName.csv";
      const fileName = path.basename(catalogPath);
      const params = {
        Bucket: BUCKET,
        Key: catalogPath,
      };
      const s3Stream = s3.getObject(params).createReadStream();
      const sqs = new AWS.SQS();
      await new Promise((resolve, reject) => {
        s3Stream
          .pipe(csvParser())
          .on("data", async data => {
            log.info(util.inspect(data));
            await new Promise((resolve, reject) => {
              sqs.sendMessage(
                { QueueUrl: process.env.SQS_URL, MessageBody: JSON.stringify(data) },
                (error, data) => {
                  if (error) {
                    log.error(
                      `Error while trying to send message: ${util.inspect(error)}`
                    );
                    reject();
                  }
                  log.info(`Send message for: ${util.inspect(data)}`);
                  resolve();
                }
              );
            });
          })
          .on("error", error => {
            log.error(util.inspect(error));
            reject(error);
          })
          .on("end", async () => {
            await s3
              .copyObject({
                Bucket: BUCKET,
                CopySource: BUCKET + "/" + catalogPath,
                Key: catalogPath.replace(UPLOADED_FOLDER, PARSED_FOLDER),
              })
              .promise();
            await s3.deleteObject({ Bucket: BUCKET, Key: catalogPath }).promise();
            log.info("File " + fileName + " has been moved to 'parsed' folder");
            resolve();
          });
      });
    }
  },
};
