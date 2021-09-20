import time from "../time";
import { getProductsList } from "./getProductsList";

jest.mock("../logger");
jest.mock("../PostgresClient");
jest.mock("../time");
time.getTimestamp.mockImplementation(() => ({}));

describe("Product Service: Testing getProductsList:", () => {
  it("Lambda function is defined", () => {
    expect(getProductsList).toBeDefined();
  });

  it("Should return product list", async () => {
    const event = {};
    const result = await getProductsList(event);
    expect(result).toHaveProperty("body");
    const body = JSON.parse(result.body);
    expect(body.ok).toBe(true);
    expect(body).toHaveProperty("products");
  });
});
