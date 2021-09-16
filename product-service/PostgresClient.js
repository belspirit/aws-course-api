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

export async function query(query) {
  log.info(`running SQL query: ${query}`);
  let client;
  try {
    client = new Client(dbConfig);
    await client.connect();
    const queryResult = await client.query(query);
    const rows = queryResult.rows.map(parseTypes);
    return { ok: true, rows, rowsAffected: queryResult.rowCount };
  } catch (error) {
    log.error(`Error while running SQL query: ${util.inspect(error)}`);
    return { ok: false, message: error };
  } finally {
    await client.end();
  }
}
