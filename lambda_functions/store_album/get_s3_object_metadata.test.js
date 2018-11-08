const getS3ObjectMetadata = require('./get_s3_object_metadata.js');
const AWS = require('aws-sdk')
const AWS_MOCK = require('aws-sdk-mock');
const s3bucket = "myTestBucket";
const s3key = "myS3key";

test('LastModified', async () => {
    expect.assertions(2);

    // Mock out the AWS method
    AWS_MOCK.mock("S3", "headObject", {LastModified: 1000});

    // create the AWS service *after* the service method has been mocked
    const s3 = new AWS.S3();

    const s3ObjectMetadata = await getS3ObjectMetadata(s3, s3bucket, s3key);
    expect(s3ObjectMetadata).toBeDefined();
    expect(s3ObjectMetadata.LastModified).toBe(1000);

    AWS_MOCK.restore('S3');
});