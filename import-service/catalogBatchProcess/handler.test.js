const AWSMock = require("aws-sdk-mock");
const catalogBatchProcess = require("./handler").catalogBatchProcess;
const lambdaEventMock = require("lambda-event-mock");
const log = require("../logger");
jest.mock("../logger");
jest.mock("axios");

const sqsEventMock = lambdaEventMock
  .sqs()
  .body(JSON.stringify({ id: "TEST_ID", title: "Product1" }))
  .build();

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
    expect(log.info).toBeCalled();
    expect(log.error).not.toBeCalled();
  });

  it("Function called sns.Publish", async () => {
    await catalogBatchProcess(sqsEventMock);
    expect(snsPublishMock).toBeCalled();
    expect(log.info).toBeCalledWith(expect.stringMatching(/title: 'Product1'/));
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
    expect(log.error).toBeCalledWith(
      expect.stringMatching(/Error while trying to send SNS/)
    );
  });
});
