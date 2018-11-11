const updateAlbum = require("./update_album.js");
const BadRequestException = require("./BadRequestException.js");
const AWS = require("aws-sdk");
const AWS_MOCK = require("aws-sdk-mock");
const awsRegion = "us-west-2";
const tableName = "NotARealTableName";

const albumPath = "/not/a/real/album";

let docClient; // AWS DynamoDB docClient.  Created in beforeEach()

//
// TEST SETUP AND TEARDOWN
//

beforeEach(() => {
	// Mock out the AWS method
	const mockResponse = {};
	AWS_MOCK.mock("DynamoDB.DocumentClient", "update", mockResponse);

	// Create the AWS service *after* the service method has been mocked
	docClient = new AWS.DynamoDB.DocumentClient({
		region: awsRegion
	});

	return docClient;
});

afterEach(() => {
	AWS_MOCK.restore("DynamoDB.DocumentClient");
});

//
// TESTS
//

test("Update Album title", async () => {
	expect.assertions(2);
	let result = await updateAlbum(docClient, tableName, albumPath, {
		title: "New Title 1"
	});
	expect(result).toBeDefined();
	expect(Object.keys(result).length === 0).toBeTruthy();
});

test("Update Album description", async () => {
	expect.assertions(2);
	let result = await updateAlbum(docClient, tableName, albumPath, {
		description: "New Description 1"
	});
	expect(result).toBeDefined();
	expect(Object.keys(result).length === 0).toBeTruthy();
});

test("Update Album title and description", async () => {
	expect.assertions(2);
	let result = await updateAlbum(docClient, tableName, albumPath, {
		title: "New Title 2",
		description: "New Description 2"
	});
	expect(result).toBeDefined();
	expect(Object.keys(result).length === 0).toBeTruthy();
});

test("Update Album with empty data", async () => {
	expect.assertions(1);
	try {
		let result = await updateAlbum(docClient, tableName, albumPath, {});
		throw ("Was not expecting success.  Got: ", result);
	} catch (e) {
		expect(e).toBeInstanceOf(BadRequestException); // Expect this error
	}
});

test("Update Album with null data", async () => {
	expect.assertions(1);
	try {
		let result = await updateAlbum(docClient, tableName, albumPath, null);
		throw ("Was not expecting success.  Got: ", result);
	} catch (e) {
		expect(e).toBeInstanceOf(BadRequestException); // Expect this error
	}
});

test("Update Album with only bad data", async () => {
	expect.assertions(2);
	try {
		let result = await updateAlbum(docClient, tableName, albumPath, {
			noSuchAttribute: "some value"
		});
		throw ("Was not expecting success.  Got: ", result);
	} catch (e) {
		expect(e).toBeInstanceOf(BadRequestException); // Expect this error
		expect(e.message).toContain("noSuchAttribute");
	}
});

test("Update Album with both real and bad data", async () => {
	expect.assertions(2);
	try {
		let result = await updateAlbum(docClient, tableName, albumPath, {
			title: "New Title 3",
			noSuchAttribute: "some value"
		});
		throw ("Was not expecting success.  Got: ", result);
	} catch (e) {
		expect(e).toBeInstanceOf(BadRequestException); // Expect this error
		expect(e.message).toContain("noSuchAttribute");
	}
});
