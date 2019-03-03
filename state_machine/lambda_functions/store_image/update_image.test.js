const updateImage = require("./update_image.js");
const AWS = require("aws-sdk");
const AWS_MOCK = require("aws-sdk-mock");
const awsRegion = "us-west-2";
const tableName = "NotRealImageTable";
const imageId = "/not/a/real/image.jpg";
const metadata = {
	creationTime: "2016:07:06 09:48:21",
	geo: {
		latitude: {
			D: 33,
			M: 53,
			S: 52.41,
			Direction: "N"
		},
		longitude: {
			D: 118,
			M: 25,
			S: 7.25,
			Direction: "W"
		}
	},
	exifMake: "LGE",
	exifModel: "Nexus 5X",
	dimensions: {
		width: 4032,
		height: 3024
	},
	fileSize: "2.136MB",
	format: "JPEG"
};

test("Update Image", async () => {
	expect.assertions(2);

	// Mock out the AWS method
	AWS_MOCK.mock("DynamoDB.DocumentClient", "update", "success");

	// Create the AWS service *after* the service method has been mocked
	const docClient = new AWS.DynamoDB.DocumentClient({
		region: awsRegion
	});

	const updateResult = await updateImage(
		docClient,
		tableName,
		imageId,
		true,
		metadata
	);
	expect(updateResult).toBeDefined();
	//console.log(updateResult);
	expect(updateResult).toBe("success");

	AWS_MOCK.restore("DynamoDB.DocumentClient");
});
