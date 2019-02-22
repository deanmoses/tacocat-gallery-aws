const AWS = require("./utils/configure_aws.js");
const getStackConfiguration = require("./utils/get_stack_configuration.js");
const fs = require("fs");
const path = require("path");
const s3 = new AWS.S3();

let stack; // information about the deployed CloudFormation stack

beforeAll(async () => {
	stack = await getStackConfiguration();
});

test("Describe stack", async () => {
	expect(stack.originalImagePrefix).toBe("albums");
	expect(stack.thumbnailImagePrefix).toBe("thumb");
	expect(stack.largeImagePrefix).toBe("large");
});

test("Upload image", async () => {
	const filename = "test_image_1.jpg";
	const filepath = path.join(__dirname, filename);
	const uploadParams = {
		Bucket: stack.originalImageBucketName,
		Key: stack.originalImagePrefix + "/2001/01-31/test_image_1.jpg",
		Body: fs.createReadStream(filepath)
	};
	const uploadResult = await s3.upload(uploadParams).promise();
	expect(uploadResult).toBeDefined();
	expect(uploadResult.Location).toBeDefined();
	expect(uploadResult.Location).toContain(filename);
});
