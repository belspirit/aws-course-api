const AWSMock = require("aws-sdk-mock");
const importProductsFile = require("./handler").importProductsFile;
const lambdaEventMock = require("lambda-event-mock");
const log = require("../logger");
jest.mock("../logger");

const s3getSignedUrlMock = jest
  .fn()
  .mockImplementation((catalogPath, params, callback) =>
    callback(undefined, "signed_url")
  );

describe("importProductsFile Lambda function test suit:", () => {
  beforeEach(() => {
    AWSMock.mock("S3", "getSignedUrl", s3getSignedUrlMock);
  });

  afterEach(() => {
    AWSMock.restore();
    jest.clearAllMocks();
  });

  it("Should return error when name query parameter is not defined", async () => {
    let apiGatewayEventMock = lambdaEventMock.apiGateway().path("/import").build();
    const result = await importProductsFile(apiGatewayEventMock);
    expect(result).toHaveProperty("body");
    const body = JSON.parse(result.body);
    expect(body.ok).toBe(false);
    expect(body).toHaveProperty("message");
    expect(body.message).toContain("Query parameter 'name' not found");
  });

  it("Should return ok true and signedUrl", async () => {
    let apiGatewayEventMock = lambdaEventMock
      .apiGateway()
      .path("/import")
      .queryStringParameter("name", "123.csv")
      .build();
    const result = await importProductsFile(apiGatewayEventMock);
    expect(result).toHaveProperty("body");
    const body = JSON.parse(result.body);
    expect(body.ok).toBe(true);
    expect(s3getSignedUrlMock).toBeCalled();
    expect(log.info).toBeCalled();
    expect(log.error).not.toBeCalled();
    expect(body).toHaveProperty("signedUrl");
    expect(body.signedUrl).toBe("signed_url");
  });
});
