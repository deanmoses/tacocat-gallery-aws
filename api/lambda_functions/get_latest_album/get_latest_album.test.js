const getLatestAlbum = require("./get_latest_album.js");
const AWS = require("aws-sdk");
const AWS_MOCK = require("aws-sdk-mock");
const awsRegion = "us-west-2";
const tableName = "NotARealTableName";

test("Get Album", async () => {
	expect.assertions(2);

	const albumPath = "/not/a/real/album";
	const updateDateTime = 1541787209;

	// Mock out the AWS method
	const mockResponse = {
		Items: [{ albumID: albumPath, updateDateTime: updateDateTime }]
	};
	AWS_MOCK.mock("DynamoDB.DocumentClient", "query", mockResponse);

	// Create the AWS service *after* the service method has been mocked
	const docClient = new AWS.DynamoDB.DocumentClient({
		region: awsRegion
	});

	const result = await getLatestAlbum(docClient, tableName);
	const album = result.album;
	expect(album).toBeDefined();
	expect(updateDateTime).toBe(updateDateTime);
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
