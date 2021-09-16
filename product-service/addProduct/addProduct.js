"use strict";
import merge from "lodash/merge";
import util from "util";
import { corsResponse } from "../corsResponse";
import log from "../logger";
import { query } from "../PostgresClient";

export const addProduct = async event => {
  log.info(`addProduct function is called with args: ${util.inspect(event)}`);
  const product = JSON.parse(event.body || "{}");
  const { title, description = "", price = 0, count = 0 } = product;

  if (typeof title !== "string" || title.length === 0) {
    log.error(`Error while trying to addProduct - title is not defined`);
    return merge(corsResponse, {
      statusCode: 400,
      body: JSON.stringify({
        ok: false,
        message: `You should provide the product title`,
      }),
    });
  }

  let productId;

  try {
    // start transaction
    await query("BEGIN;");

    const responseQueryAddProduct = await query(
      `INSERT INTO products (title, description, price) VALUES ('${title}', '${description}', ${price}) RETURNING id`
    );
    if (!responseQueryAddProduct.ok || responseQueryAddProduct.rowsAffected === 0) {
      // rollback transaction
      await query("ROLLBACK;");
      log.error(`Error while trying to add new product - PostgresDB error`);
      return merge(corsResponse, {
        statusCode: 500,
        body: JSON.stringify({ ok: true, message: responseQueryAddProduct.message }),
      });
    }

    log.info(JSON.stringify(responseQueryAddProduct));

    productId = responseQueryAddProduct.rows[0].id;

    const responseQueryAddStock = await query(
      `INSERT INTO stocks (product_id, count) VALUES ('${productId}', ${count})`
    );
    if (!responseQueryAddStock.ok || responseQueryAddStock.rowsAffected === 0) {
      await query("ROLLBACK;");
      log.error(`Error while trying to add new stock - PostgresDB error`);
      return merge(corsResponse, {
        statusCode: 500,
        body: JSON.stringify({ ok: true, message: responseQueryAddStock.message }),
      });
    }
  } catch (error) {
    log.error(`Error in addProduct call: ${util.inspect(error)}`);
    await query("ROLLBACK;");
    return merge(corsResponse, {
      statusCode: 500,
      body: JSON.stringify({ ok: true, message: responseQueryAddStock.message }),
    });
  } finally {
    // end transaction
    await query("END;");
  }

  const imageUrl = `https://source.unsplash.com/featured?nature,water&sig=${productId}`;

  const updatedProduct = { id: productId, ...product, imageUrl };

  return merge(corsResponse, {
    statusCode: 200,
    body: JSON.stringify({ ok: true, product: updatedProduct }),
  });

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
