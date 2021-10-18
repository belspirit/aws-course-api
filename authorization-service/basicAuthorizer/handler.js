const util = require("util");
const log = require("../logger");

const generatePolicy = (principalId, resource, effect = "Allow") => ({
  principalId,
  policyDocument: {
    Version: "2012-10-17",
    Statement: {
      Action: "execute-api:Invoke",
      Effect: effect,
      Resource: resource,
    },
  },
});

module.exports = {
  basicAuthorizer: async function (event) {
    log.info(`basicAuthorizer function is called with args: ${util.inspect(event)}`);

    if (event["type"] !== "TOKEN") {
      return "Unauthorized";
    }

    try {
      const authorizationToken = event.authorizationToken;
      // 'Basic 1238c9fabef==
      const encodedCreds = authorizationToken.split(" ")[1];

      const buff = Buffer.from(encodedCreds, "base64");
      const plainCreds = buff.toString("utf-8").split(":");
      const username = plainCreds[0];
      const password = plainCreds[1];

      log.info(`username: ${username} and password: ${password}`);

      const storedUserPassword = process.env[username];
      const effect = storedUserPassword != password ? "Deny" : "Allow";

      const policy = generatePolicy(encodedCreds, event.methodArn, effect);
      return policy;
    } catch (error) {
      return `Unauthorized: ${error.message}`;
    }
  },
};
