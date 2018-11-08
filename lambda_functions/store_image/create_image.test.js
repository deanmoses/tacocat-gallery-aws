const createImage = require('./create_image.js');
const AWS = require('aws-sdk')
const AWS_MOCK = require('aws-sdk-mock');
const awsRegion = "us-west-2";
const tableName = "NotRealImageTable";
const imageId = "/not/a/real/image.jpg";
const albumId = "/not/a/real/album"

test('Create Image', async () => {
    expect.assertions(2);

    // Mock out the AWS method
    AWS_MOCK.mock("DynamoDB.DocumentClient", "put", "success");

    // Create the AWS service *after* the service method has been mocked
    const docClient = new AWS.DynamoDB.DocumentClient({
        region: awsRegion
    });

    const createResult = await createImage(docClient, tableName, imageId, albumId);
    expect(createResult).toBeDefined();
    //console.log(createResult);
    expect(createResult).toBe("success");

    AWS_MOCK.restore('DynamoDB.DocumentClient');
});