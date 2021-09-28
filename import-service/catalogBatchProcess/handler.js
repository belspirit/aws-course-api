const util = require("util");
const AWS = require("aws-sdk");
const axios = require("axios").default;
const log = require("../logger");
const schemas = require("../schemas").schemas;

const addProductUrl = "https://n4w7ktp7nk.execute-api.us-east-1.amazonaws.com/products";

module.exports = {
  catalogBatchProcess: async function (event) {
    const sns = new AWS.SNS();
    for (let record of event.Records) {
      const receivedProduct = JSON.parse(record.body);
      log.info(util.inspect(receivedProduct));

      let product;
      // check validity
      try {
        product = await schemas.product.cast(receivedProduct);
        product = await schemas.product.validate(product);
      } catch (error) {
        log.error(`Product validation error: ${util.inspect(error)}`);
        continue;
      }

      try {
        await axios.post(addProductUrl, {
          title: product.title,
          description: product.description,
          price: product.price,
          count: product.count,
        });
      } catch (error) {
        log.error(`Error while trying to create a new Product: ${util.inspect(error)}`);
        continue;
      }

      try {
        await sns
          .publish({
            Message: `Product was created: ${JSON.stringify(product)}`,
            TopicArn: process.env.SNS_TOPIC_NAME,
            MessageAttributes: {
              event: {
                Type: "String",
                Value: "product_created",
              },
              price_usd: {
                Type: "Number",
                Value: product.price,
              },
            },
          })
          .promise();
      } catch (error) {
        log.error(`Error while trying to send SNS message: ${util.inspect(error)}`);
      }
    }
  },
};
