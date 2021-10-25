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
      log.info(`User unauthorized`);
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

      log.info(`username: '${username}' and password: '${password}'`);

      const storedUserPassword = process.env[username];
      log.info(`storedUserPassword: ${storedUserPassword}`);
      const effect =
        !storedUserPassword || storedUserPassword != password ? "Deny" : "Allow";
      log.info(`Access: ${effect}`);

      const policy = generatePolicy(encodedCreds, event.methodArn, effect);
      log.info(`Policy: ${JSON.stringify(policy)}`);
      return policy;
    } catch (error) {
      log.info(`User unauthorized`);
      return `Unauthorized: ${error.message}`;
    }
  },
};
