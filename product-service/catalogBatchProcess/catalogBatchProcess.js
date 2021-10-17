import AWS from "aws-sdk";
import util from "util";
import { addProduct } from "../addProduct";
import log from "../logger";
import { schemas } from "../schemas";

export const catalogBatchProcess = async event => {
  const sns = new AWS.SNS();
  for (let record of event.Records) {
    const receivedProduct = JSON.parse(record.body);
    log.info(util.inspect(receivedProduct));

    let product;
    // check validity
    try {
      product = await schemas.product.validate(receivedProduct);
    } catch (error) {
      log.error(`Product validation error: ${util.inspect(error)}`);
      continue;
    }

    try {
      await addProduct({ body: product });
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
              DataType: "String",
              StringValue: "product_created",
            },
            price_usd: {
              DataType: "Number",
              StringValue: String(product.price),
            },
          },
        })
        .promise();
    } catch (error) {
      log.error(`Error while trying to send SNS message: ${util.inspect(error)}`);
    }
  }
};
