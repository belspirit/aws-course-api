"use strict";
import merge from "lodash/merge";
import log from "winston";
import products from "../products.json";
import time from "../time";

export const getProductsById = async event => {
  let { id: productId } = event.pathParameters || {};
  if (typeof productId === "string") {
    productId = productId.trim();
  }
  const timestamp = await time.getTimestamp();
  const response = {
    headers: {
      "content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    },
    statusCode: 200,
  };

  if (!productId || productId.length === 0) {
    log.error(`Error while trying to getProductsById - Product ID not defined`);
    return merge(response, {
      statusCode: 400,
      body: JSON.stringify({
        ok: false,
        message: `You should provide the product ID '/products/{id}'`,
        timestamp,
      }),
    });
  }

  const product = products.find(p => p.id == productId);
  if (product === undefined) {
    return merge(response, {
      statusCode: 404,
      body: JSON.stringify({
        ok: false,
        message: `Product with ID ${productId} not found`,
        timestamp,
      }),
    });
  }

  product.imageUrl = `https://source.unsplash.com/featured?nature,water&sig=${productId}`;

  return merge(response, {
    statusCode: 200,
    body: JSON.stringify({ ok: true, product, timestamp }),
  });

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
