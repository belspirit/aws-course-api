"use strict";
import axios from "axios";
import log from "winston";

/** Get current time stamp from WorldTimeApi
 * 
 * @returns {Promise<Object>} timestamp object
 * const some = {
  abbreviation: "+05",
  client_ip: "5.62.62.31",
  datetime: "2021-08-29T07:25:03.765112+05:00",
  day_of_week: 0,
  day_of_year: 241,
  dst: false,
  dst_from: null,
  dst_offset: 0,
  dst_until: null,
  raw_offset: 18000,
  timezone: "Etc/GMT-5",
  unixtime: 1630203903,
  utc_datetime: "2021-08-29T02:25:03.765112+00:00",
  utc_offset: "+05:00",
  week_number: 34,
};
 */
export async function getTimestamp() {
  try {
    const timeResponse = await axios.get(
      `https://worldtimeapi.org/api/timezone/Etc/GMT-5`
    );
    if (timeResponse.status !== 200) {
      log.error(`Error when trying to get current timestamp`);
    }

    return timeResponse.data.datetime;
  } catch (err) {
    log.error(`Error when trying to get current timestamp: ${err.message}`);
  }
}

export default {
  getTimestamp,
};
