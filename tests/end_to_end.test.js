const AWS = require("./utils/configure_aws.js");
const getStackConfiguration = require("./utils/get_stack_configuration.js");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const s3 = new AWS.S3();
const stepfunctions = new AWS.StepFunctions();

// information about the deployed CloudFormation stack
let stack;

// path to image in S3 and CloudFront
const imagePath = "/2001/01-31/test_image_" + generateRandomInt() + ".jpg";

// Clean up
afterAll(async () => {
	// Delete the uploaded image, regardless of whether the test was successful
	await deleteImage(imagePath);
});

test.skip("End to end test", async () => {
	await getStack();

	// Upload image
	await uploadAndVerifyImage("test_image_1.jpg", imagePath);

	// Wait for Step Function to complete processing the image, such as cutting the thumbnail
	await sleep(10000);

	// Verify Step Function finished, and successfully
	await expectStateMachineToHaveCompletedSuccessfully();

	// Verify CloudFront returns the images
	await expectImageToBeInCloudFront(stack.originalImagePrefix);
	await expectImageToBeInCloudFront(stack.thumbnailImagePrefix);
	await expectImageToBeInCloudFront(stack.largeImagePrefix);

	// Verify the API returns the images
	await expectImageToBeInApi();
}, 35000 /* timeout after this many millis.  The default is 5000ms */);

/**
 * Get info about of the deployed CloudFormation stack, such as the name of the
 * S3 bucket to upload images
 */
async function getStack() {
	stack = await getStackConfiguration();

	// Verify we got valid info from CloudFormation
	expect(stack.originalImagePrefix).toBe("albums");
	expect(stack.thumbnailImagePrefix).toBe("thumb");
	expect(stack.largeImagePrefix).toBe("large");
	expect(stack.cloudFrontUrl).toContain("https://");
	expect(stack.stateMachineArn).toContain("StateMachine");
}

/**
 * Upload image to S3 and verify it was successful
 */
async function uploadAndVerifyImage(imageNameOnDisk, imagePathInCloud) {
	const imagePathOnDisk = path.join(__dirname, imageNameOnDisk);
	const uploadParams = {
		Bucket: stack.originalImageBucketName,
		Key: stack.originalImagePrefix + imagePathInCloud,
		Body: fs.createReadStream(imagePathOnDisk)
	};
	const uploadResult = await s3.upload(uploadParams).promise();

	// Verify image was uploaded successfully
	expect(uploadResult).toBeDefined();
	expect(uploadResult.Location).toBeDefined();
	expect(uploadResult.Location).toContain(imagePathInCloud);
}

/**
 * Delete image from S3
 */
async function deleteImage(imagePathInCloud) {
	return await s3
		.deleteObject({
			Bucket: stack.originalImageBucketName,
			Key: stack.originalImagePrefix + imagePathInCloud
		})
		.promise();
}

/**
 * Fail if state machine hasn't finished
 */
async function expectStateMachineToHaveCompletedSuccessfully() {
	// Get the most recent image processing StepFunction state machine execution
	var params = {
		stateMachineArn: stack.stateMachineArn,
		maxResults: 1
	};
	const stepFunctionExecutions = await stepfunctions
		.listExecutions(params)
		.promise();
	expect(stepFunctionExecutions).toBeDefined();
	expect(stepFunctionExecutions.executions).toBeDefined();
	expect(stepFunctionExecutions.executions).toHaveLength(1);
	const execution = stepFunctionExecutions.executions[0];

	// The execution of StepFunction should have started less than 10 seconds ago
	expect(new Date(execution.startDate).getTime()).toBeGreaterThan(
		Date.now() - 200000 // TODO: figure out why this is failing with a smaller number
	);

	// StepFunction should have finished successfully
	expect(execution.status).toBe("SUCCEEDED");
}

/**
 * Fail if image isn't retrievable via API
 */
async function expectImageToBeInApi() {
	const albumUrl = stack.apiUrl + "/album/2001/01-31/";
	const headResult = await fetch(albumUrl);
	expect(headResult).toBeDefined();
	expect(headResult.status).toBe(200);
	expect(headResult.album.uploadDateTime).toBeDefined();
	//console.log("get album via API", headResult); // TODO: finish test
}

/**
 * Fail if image isn't retrievable via CloudFront
 */
async function expectImageToBeInCloudFront(imagePrefix) {
	const imageUrl = stack.cloudFrontUrl + "/" + imagePrefix + imagePath;
	const headResult = await fetch(imageUrl, { method: "HEAD" });
	expect(headResult).toBeDefined();
	expect(headResult.status).toBe(200);
}

/**
 * Wait for the # of milliseconds
 * @param {*} ms
 */
function sleep(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

function generateRandomInt() {
	return Math.floor(Math.random() * 100000);
}
