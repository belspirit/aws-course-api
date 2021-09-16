import winston from "winston";

winston.add(new winston.transports.Console());

export const log = winston;

export default log;
