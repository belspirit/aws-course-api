import time from "../time";
import { getProductsById } from "./getProductsById";
jest.mock("winston");
jest.mock("../time");
time.getTimestamp.mockImplementation(() => ({}));

describe("Product Service: Testing getProductsById:", () => {
  it("Lambda function is defined", () => {
    expect(getProductsById).toBeDefined();
  });

  it("Should return error when Id is not defined", async () => {
    const productId = undefined;
    const event = {
      pathParameters: { id: productId },
    };
    const result = await getProductsById(event);
    expect(result).toHaveProperty("body");
    const body = JSON.parse(result.body);
    expect(body.ok).toBe(false);
    expect(body).toHaveProperty("message");
    expect(body.message).toContain("You should provide the product ID");
  });

  it("Should return error when Id is empty string", async () => {
    const productId = " ";
    const event = {
      pathParameters: { id: productId },
    };
    const result = await getProductsById(event);
    expect(result).toHaveProperty("body");
    const body = JSON.parse(result.body);
    expect(body.ok).toBe(false);
    expect(body).toHaveProperty("message");
    expect(body.message).toContain("You should provide the product ID");
  });

  it("Should return error message when Id is not defined", async () => {
    const productId = "WRONG ID";
    const event = {
      pathParameters: { id: productId },
    };
    const result = await getProductsById(event);
    expect(result).toHaveProperty("body");
    const body = JSON.parse(result.body);
    expect(body.ok).toBe(false);
    expect(body).toHaveProperty("message");
    expect(body.message).toBe(`Product with ID ${productId} not found`);
  });

  it("Should return product by ID", async () => {
    const productId = "7567ec4b-b10c-48c5-9345-fc73c48a80aa";
    const event = {
      pathParameters: { id: productId },
    };
    const result = await getProductsById(event);
    expect(result).toHaveProperty("body");
    const body = JSON.parse(result.body);
    expect(body.ok).toBe(true);
    expect(body).toHaveProperty("product");
  });
});
