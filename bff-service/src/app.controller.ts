import { All, Controller, HttpException, HttpStatus, Request } from "@nestjs/common";
import axios from "axios";
import { twoMinutes } from "./constants";

const productsCache = { expiration: 0, cache: undefined };

@Controller()
export class AppController {
  @All("/*")
  async getProfile(@Request() req) {
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
      // getProductsList cache
      if (
        recipient == "product" &&
        recipientPath == "/products" &&
        productsCache.expiration > new Date().valueOf()
      ) {
        console.log("Return cached products");
        return {
          statusCode: HttpStatus.OK,
          data: productsCache.cache
        };
      }

      const axiosConfig = {
        method: req.method,
        url: `${recipientURL}${recipientPath}`,
        ...(Object.keys(req.body || {}).length > 0 && { data: req.body })
      };
      console.log("axiosConfig: ", axiosConfig);

      try {
        const response = await axios(axiosConfig);
        // update getProductsList
        if (recipient == "product" && recipientPath.match("/products")) {
          console.log("Update products cache");
          productsCache.expiration = new Date().valueOf() + twoMinutes;
          productsCache.cache = response.data;
        }
        console.log("response from recipient", response.data);
        return {
          statusCode: response.status,
          data: response.data
        };
      } catch (error) {
        console.log("recipient error: ", JSON.stringify(error));
        if (error.response) {
          const { status, data } = error.response;
          throw new HttpException(data, status);
        } else {
          throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    } else {
      throw new HttpException("Cannot process request", HttpStatus.BAD_GATEWAY);
    }
  }
}
