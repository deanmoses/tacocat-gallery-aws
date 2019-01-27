const getLatestAlbum = require("./get_latest_album.js");
const AWS = require("aws-sdk");
const AWS_MOCK = require("aws-sdk-mock");
const awsRegion = "us-west-2";
const tableName = "NotARealTableName";

test("Get Album", async () => {
	expect.assertions(3);

	const albumPath = "/not/a/real/album";
	const uploadTimeStamp = 1541787209;

	// Mock out the AWS method
	const mockResponse = {
		Items: [{ albumID: albumPath, uploadTimeStamp: uploadTimeStamp }]
	};
	AWS_MOCK.mock("DynamoDB.DocumentClient", "query", mockResponse);

	// Create the AWS service *after* the service method has been mocked
	const docClient = new AWS.DynamoDB.DocumentClient({
		region: awsRegion
	});

	const result = await getLatestAlbum(docClient, tableName);
	expect(result).toBeDefined();
	expect(result.albumID).toBe(albumPath);
	expect(result.uploadTimeStamp).toBe(uploadTimeStamp);
	AWS_MOCK.restore("DynamoDB.DocumentClient");
});

test("Get Nonexistent Album", async () => {
	expect.assertions(1);

	// Mock out the AWS method
	const mockResponse = {
		Items: []
	};
	AWS_MOCK.mock("DynamoDB.DocumentClient", "query", mockResponse);

	// Create the AWS service *after* the service method has been mocked
	const docClient = new AWS.DynamoDB.DocumentClient({
		region: awsRegion
	});

	const result = await getLatestAlbum(docClient, tableName);
	expect(result).toBeUndefined();
	AWS_MOCK.restore("DynamoDB.DocumentClient");
});
