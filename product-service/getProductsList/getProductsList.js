"use strict";
import merge from "lodash/merge";
import util from "util";
//import time from "../time";
import { corsResponse } from "../corsResponse";
import log from "../logger";
import { PostgresClient } from "../PostgresClient";

export const getProductsList = async event => {
  log.info(`getProductsList function is called with args: ${util.inspect(event)}`);
  //const timestamp = await time.getTimestamp();
  const client = await PostgresClient.build();
  const responseQuery = await client.fetchProductsList();
  await client.close();
  if (!responseQuery.ok) {
    log.error(`Error while trying to getProductsList - PostgresDB error`);
    return merge(corsResponse, {
      statusCode: 500,
      body: JSON.stringify({ ok: true, message: responseQuery.message }),
    });
  }
  const productList = responseQuery.rows;

  const products = productList.map(p =>
    merge(p, {
      imageUrl: `https://source.unsplash.com/featured?nature,water&sig=${p.id}`,
    })
  );
  return merge(corsResponse, {
    statusCode: 200,
    body: JSON.stringify({ ok: true, products }),
  });

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
