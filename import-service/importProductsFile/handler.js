const AWS = require("aws-sdk");
const BUCKET = "import-service-labetik-s3";
const log = require("../logger");
const util = require("util");
const merge = require("lodash/merge");
const corsResponse = require("../corsResponse");

module.exports = {
  importProductsFile: async function (event) {
    log.info(`importProductsFile function is called with args: ${util.inspect(event)}`);
    const s3 = new AWS.S3({ region: "us-east-1" });

    const queryStringParams = event.queryStringParameters || {};
    const fileName = queryStringParams.name; //catalog.csv
    if (!fileName) {
      log.info(`Query parameter 'name' not found`);
      return merge(corsResponse, {
        statusCode: 400,
        body: JSON.stringify({
          ok: false,
          message: "Query parameter 'name' not found",
        }),
      });
    }

    const params = {
      Bucket: BUCKET,
      Key: "uploaded/" + fileName,
      Expires: 60,
      ContentType: "text/csv",
    };

    try {
      const signedUrl = await s3.getSignedUrlPromise("putObject", params);
      return merge(corsResponse, {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          signedUrl,
        }),
      });
    } catch (error) {
      log.error(`Error while trying to getSignedUrl: ${util.inspect(error)}`);
      return merge(corsResponse, {
        statusCode: 500,
        body: JSON.stringify({
          ok: false,
          message: error.message,
        }),
      });
    }
  },
};
