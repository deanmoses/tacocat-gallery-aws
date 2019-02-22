const AWS = require("./utils/configure_aws.js");
const getStackConfiguration = require("./utils/get_stack_configuration.js");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const s3 = new AWS.S3();

let stack; // information about the deployed CloudFormation stack

beforeAll(async () => {
	stack = await getStackConfiguration();
});

test("Describe stack", async () => {
	expect(stack.originalImagePrefix).toBe("albums");
	expect(stack.thumbnailImagePrefix).toBe("thumb");
	expect(stack.largeImagePrefix).toBe("large");
	expect(stack.cloudFrontUrl).toContain("https://");
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

test("Fetch original image via CloudFront", async () => {
	const imageUrl =
		stack.cloudFrontUrl +
		"/" +
		stack.originalImagePrefix +
		"/2001/01-31/test_image_1.jpg";
	const headResult = await fetch(imageUrl, { method: "HEAD" });
	expect(headResult).toBeDefined();
	expect(headResult.status).toBe(200);
});

test("Fetch thumbnail version of image via CloudFront", async () => {
	const imageUrl =
		stack.cloudFrontUrl +
		"/" +
		stack.thumbnailImagePrefix +
		"/2001/01-31/test_image_1.jpg";
	const headResult = await fetch(imageUrl, { method: "HEAD" });
	expect(headResult).toBeDefined();
	expect(headResult.status).toBe(200);
});

test("Fetch large version of image via CloudFront", async () => {
	const imageUrl =
		stack.cloudFrontUrl +
		"/" +
		stack.largeImagePrefix +
		"/2001/01-31/test_image_1.jpg";
	const headResult = await fetch(imageUrl, { method: "HEAD" });
	expect(headResult).toBeDefined();
	expect(headResult.status).toBe(200);
});

test("Fetch album via API", async () => {
	const albumUrl = stack.apiUrl + "/album/2001/01-31/";
	const headResult = await fetch(albumUrl);
	expect(headResult).toBeDefined();
	expect(headResult.status).toBe(200);
	expect(headResult.album.uploadDateTime).toBeDefined();
	//console.log("get album via API", headResult); // TODO: finish test
});
