const createAlbum = require("./create_album.js");
const AWS = require("aws-sdk");
const AWS_MOCK = require("aws-sdk-mock");
const awsRegion = "us-west-2";
const albumId = "/not/an/album";
const fileUploadTimeStamp = 100000;

test("Create Album", async () => {
	expect.assertions(2);

	// Mock out the AWS method
	AWS_MOCK.mock("DynamoDB.DocumentClient", "put", "success");

	// Create the AWS service *after* the service method has been mocked
	const docClient = new AWS.DynamoDB.DocumentClient({
		region: awsRegion
	});

	const createResult = await createAlbum(
		docClient,
		albumId,
		fileUploadTimeStamp
	);
	expect(createResult).toBeDefined();
	//console.log(createResult);
	expect(createResult).toBe("success");

	AWS_MOCK.restore("DynamoDB.DocumentClient");
});
