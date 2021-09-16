"use strict";
import merge from "lodash/merge";
//import time from "../time";
import util from "util";
import corsResponse from "../corsResponse";
import log from "../logger";
import { query } from "../PostgresClient";

export const getProductsById = async event => {
  log.info(`getProductsById function is called with args: ${util.inspect(event)}`);
  let { id: productId } = event.pathParameters || {};
  if (typeof productId === "string") {
    productId = productId.trim();
  }
  //const timestamp = await time.getTimestamp();

  if (productId === undefined || productId.length === 0) {
    log.error(`Error while trying to getProductsById - Product ID not defined`);
    return merge(corsResponse, {
      statusCode: 400,
      body: JSON.stringify({
        ok: false,
        message: `You should provide the product ID '/products/{id}'`,
      }),
    });
  }

  const responseQuery = await query(
    `SELECT id, title, description, price, count FROM products p INNER JOIN stocks s ON p.id = s.product_id WHERE p.id::text = '${productId}'`
  );
  if (!responseQuery.ok) {
    log.error(`Error while trying to getProductsById - PostgresDB error`);
    return merge(corsResponse, {
      statusCode: 500,
      body: JSON.stringify({ ok: true, message: responseQuery.message }),
    });
  }
  const productList = responseQuery.rows;

  const product = productList.find(p => p.id == productId);
  if (product === undefined) {
    log.info(`Product ID not found on getProductsById`);
    return merge(corsResponse, {
      statusCode: 404,
      body: JSON.stringify({
        ok: false,
        message: `Product with ID ${productId} not found`,
      }),
    });
  }

  product.imageUrl = `https://source.unsplash.com/featured?nature,water&sig=${productId}`;

  return merge(corsResponse, {
    statusCode: 200,
    body: JSON.stringify({ ok: true, product }),
  });

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
