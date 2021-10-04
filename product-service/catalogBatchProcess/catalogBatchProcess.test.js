import AWSMock from "aws-sdk-mock";
import lambdaEventMock from "lambda-event-mock";
import * as addProduct from "../addProduct";
import log from "../logger";
import { catalogBatchProcess } from "./catalogBatchProcess";
jest.mock("../logger");
jest.mock("../addProduct");

const sqsEventMock = lambdaEventMock
  .sqs()
  .body(JSON.stringify({ id: "TEST_ID", title: "Product1" }))
  .build();

addProduct.addProduct.mockImplementation(() => Promise.resolve({}));
const logInfoSpy = jest.spyOn(log, "info");
const logErrorSpy = jest.spyOn(log, "error");
const snsPublishMock = jest.fn().mockImplementation(() => Promise.resolve());

describe("importFileParser Lambda function test suit:", () => {
  beforeEach(() => {
    AWSMock.mock("SNS", "publish", snsPublishMock);
  });

  afterEach(() => {
    AWSMock.restore();
    jest.clearAllMocks();
  });

  it("Function not logged any errors", async () => {
    await catalogBatchProcess(sqsEventMock);
    expect(logInfoSpy).toBeCalled();
    expect(logErrorSpy).not.toBeCalled();
  });

  it("Function called addProduct()", async () => {
    await catalogBatchProcess(sqsEventMock);
    expect(addProduct.addProduct).toBeCalled();
    expect(logErrorSpy).not.toBeCalled();
  });

  it("Function called sns.Publish", async () => {
    await catalogBatchProcess(sqsEventMock);
    expect(snsPublishMock).toBeCalled();
    expect(addProduct.addProduct).toBeCalled();
    expect(logInfoSpy).toBeCalledWith(expect.stringMatching(/title: 'Product1'/));
    expect(logErrorSpy).not.toBeCalled();
  });

  it("Function should log error when sns.Publish throw an error", async () => {
    AWSMock.restore();
    const snsPublishErrorMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.reject(new Error("Something really bad happened"))
      );
    AWSMock.mock("SNS", "publish", snsPublishErrorMock);
    await catalogBatchProcess(sqsEventMock);
    expect(snsPublishErrorMock).toBeCalled();
    expect(logErrorSpy).toBeCalledWith(
      expect.stringMatching(/Error while trying to send SNS/)
    );
  });
});
