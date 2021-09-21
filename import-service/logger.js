const winston = require("winston");

winston.add(new winston.transports.Console());

const log = winston;

module.exports = log;
