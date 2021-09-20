import { Client } from "pg";
import util from "util";
import dbConfig from "./dbConfig";
import log from "./logger";

function isValidDate(value) {
  const date = new Date(value);
  return date instanceof Date && !isNaN(date);
}

function isValidNumber(value) {
  return !Number.isNaN(Number(value));
}

function parseTypes(row) {
  let newRow = { ...row };
  Object.keys(newRow).map(key => {
    const value = newRow[key];
    if (isValidNumber(value)) {
      newRow[key] = Number(value);
      return;
    }
    if (isValidDate(value)) {
      newRow[key] = new Date(value);
      return;
    }
  });
  return newRow;
}

export class PostgresClient {
  constructor(pgClient) {
    this.client = pgClient;
  }

  static async build() {
    const pgClient = new Client(dbConfig);
    log.info(`Connecting to DataBase...`);
    await pgClient.connect();
    log.info(`Connection to DataBase successful`);
    return new PostgresClient(pgClient);
  }

  async beginTransaction() {
    return this.#query("BEGIN;");
  }

  async endTransaction() {
    return this.#query("END;");
  }

  async rollbackTransaction() {
    return this.#query("ROLLBACK;");
  }

  async fetchProductsList() {
    return this.#query(
      `SELECT id, title, description, price, count FROM products p INNER JOIN stocks s ON p.id = s.product_id`
    );
  }

  async fetchProductsById(productId) {
    return this.#query(
      `SELECT id, title, description, price, count FROM products p INNER JOIN stocks s ON p.id = s.product_id WHERE p.id::text = '${productId}'`
    );
  }

  async insertProduct(title, description, price) {
    return this.#query(
      `INSERT INTO products (title, description, price) VALUES ('${title}', '${description}', ${price}) RETURNING id`
    );
  }

  async insertStocks(productId, count) {
    return this.#query(
      `INSERT INTO stocks (product_id, count) VALUES ('${productId}', ${count})`
    );
  }

  async #query(query) {
    log.info(`running SQL query: ${query}`);

    try {
      const queryResult = await this.client.query(query);
      const rows = queryResult.rows.map(parseTypes);
      return { ok: true, rows, rowsAffected: queryResult.rowCount };
    } catch (error) {
      log.error(`Error while running SQL query: ${util.inspect(error)}`);
      return { ok: false, message: error };
    }
  }

  async close() {
    return this.client.end();
  }
}

export default PostgresClient;
