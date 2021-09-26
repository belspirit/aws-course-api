const AWSMock = require("aws-sdk-mock");
const importFileParser = require("./handler").importFileParser;
const lambdaEventMock = require("lambda-event-mock");
const fs = require("fs");
const log = require("../logger");
jest.mock("../logger");

process.env.SQS_URL = "TEST_URL";

const s3EventMock = lambdaEventMock
  .s3()
  .object("uploaded/testName.csv")
  .bucket("test-bucket-uploaded")
  .build();

const s3getObjectMock = jest
  .fn()
  .mockImplementation(() => fs.createReadStream("testFile.csv"));
const s3copyObjectMock = jest.fn().mockImplementation(() => Promise.resolve());
const s3deleteObjectMock = jest.fn().mockImplementation(() => Promise.resolve());
const sqsSendMessageMock = jest.fn().mockImplementation((data, callback) => callback());

describe("importFileParser Lambda function test suit:", () => {
  beforeEach(() => {
    AWSMock.mock("S3", "getObject", s3getObjectMock);
    AWSMock.mock("S3", "copyObject", s3copyObjectMock);
    AWSMock.mock("S3", "deleteObject", s3deleteObjectMock);
    AWSMock.mock("SQS", "sendMessage", sqsSendMessageMock);
  });

  afterEach(() => {
    AWSMock.restore();
    jest.clearAllMocks();
  });

  it("Function not logged any errors", async () => {
    await importFileParser(s3EventMock);
    expect(log.info).toBeCalled();
    expect(log.error).not.toBeCalled();
  });

  it("Function called copy and delete file methods", async () => {
    await importFileParser(s3EventMock);
    expect(require("fs").existsSync("testFile.csv")).toBeTruthy();
    expect(s3getObjectMock).toBeCalled();
    expect(log.info).toBeCalledWith(expect.stringMatching(/Description: 'Description3'/));
    expect(s3copyObjectMock).toBeCalled();
    expect(s3deleteObjectMock).toBeCalled();
    expect(log.info).toBeCalledWith(
      expect.stringMatching(/has been moved to 'parsed' folder/)
    );
  });
});
