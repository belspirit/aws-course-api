const express = require("express");
require("dotenv").config();
const axios = require("axios").default;

const app = express();
const PORT = process.env.PORT || 3001;

const twoMinutes = 2 * 60 * 1000;
const productsCache = { expiration: 0, cache: undefined };

app.use(express.json());

app.all("/*", (req, res) => {
  console.log("originalUrl", req.originalUrl); // /products/main?res=all
  console.log("method", req.method); // POST, GET
  console.log("body", req.body); // { name: 'product-1', count: '12' }

  const recipient = req.originalUrl.split("/")[1]; // product
  console.log("recipient", recipient);

  const recipientPath = req.originalUrl.substr(recipient.length + 1);
  console.log("recipientPath", recipientPath);

  const recipientURL = process.env[recipient];
  console.log("recipientURL", recipientURL);
  if (recipientURL) {
    const axiosConfig = {
      method: req.method,
      url: `${recipientURL}${recipientPath}`,
      ...(Object.keys(req.body || {}).length > 0 && { data: req.body }),
    };

    // getProductsList cache
    if (
      recipient == "product" &&
      recipientPath.match(/^\/products/) &&
      productsCache.expiration > new Date()
    ) {
      console.log("Return cached products");
      res.json(productsCache.cache);
      return;
    }

    console.log("axiosConfig: ", axiosConfig);

    axios(axiosConfig)
      .then(response => {
        // update getProductsList
        if (recipient == "product" && recipientPath.match(/^\/products/)) {
          console.log("Update products cache");
          productsCache.expiration = new Date().valueOf() + twoMinutes;
          productsCache.cache = response.data;
        }

        console.log("response from recipient", response.data);
        res.status(res.statusCode).json(response.data);
      })
      .catch(error => {
        console.log("recipient error: ", JSON.stringify(error));

        if (error.response) {
          const { status, data } = error.response;
          res.status(status).json(data);
        } else {
          res.status(500).json({ error: error.message });
        }
      });
  } else {
    res.status(502).json({ error: "Cannot process request" });
  }
});

app.listen(PORT, () => {
  console.log(`BFF app listening at http://localhost:${PORT}`);
});
