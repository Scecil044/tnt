import winston from "winston";

class StringTransport extends winston.Transport {
  constructor(opts) {
    super(opts);
    this.logString = "";
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    //------------Include Timestamp if necessary------------
    // const message = `${info.timestamp} ${info.level}: ${info.message}`;
    const message = `${info.level}: ${info.message}`;
    this.logString = message;
    callback();
  }
}

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new StringTransport(),
    new winston.transports.Console(),
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' }),
  ],
});
