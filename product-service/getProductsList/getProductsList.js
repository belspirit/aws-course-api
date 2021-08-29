"use strict";
import merge from "lodash/merge";
import productList from "../products.json";
import time from "../time";

export const getProductsList = async event => {
  const products = productList.map(p =>
    merge(p, {
      imageUrl: `https://source.unsplash.com/featured?nature,water&sig=${p.id}`,
    })
  );
  const timestamp = await time.getTimestamp();
  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({ ok: true, products, timestamp }),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
