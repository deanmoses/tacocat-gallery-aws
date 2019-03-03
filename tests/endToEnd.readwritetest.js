//
// An end to end integration test that:
//  - creates albums & images
//  - modifies albums & images
//  - deletes albums & images
//
// This shouldn't be run on every file change because it invokes StepFunctions,
// and in January 2019 I ran this so much it nearly tapped out my AWS Free Tier
// of StepFunction executions.
//

const AWS = require("./utils/configure_aws.js");
const getStackConfiguration = require("./utils/get_stack_configuration.js");
const GalleryS3 = require("./utils/GalleryS3.js");
const GalleryApiJestHelper = require("./utils/GalleryApiJestHelper.js");
const fetch = require("node-fetch");
const s3 = new AWS.S3();
const stepfunctions = new AWS.StepFunctions();
const path = require("path");

// path to image in S3 and CloudFront
const yearAlbum = "/1901";
const weekAlbum = yearAlbum + "/01-31";
const imageNameInCloud = "test_image_" + generateRandomInt() + ".jpg";
const imagePath = weekAlbum + "/" + imageNameInCloud;

// beforeAll will set these
let stack, galleryApiJestHelper, galleryS3;

/**
 * End to end integration test
 */
describe("End to end test", async () => {
	/**
	 * Get information about the CloudFormation stack
	 */
	beforeAll(async () => {
		stack = await getStackConfiguration();
		galleryApiJestHelper = new GalleryApiJestHelper(stack);
		galleryS3 = new GalleryS3(stack);
	});

	/**
	 * CREATE YEAR ALBUM
	 */
	describe("Create year album", async () => {
		test("Album does not exist", async () => {
			await galleryApiJestHelper.expectAlbumToNotBeInApi(yearAlbum);
		});

		test("Create album in S3", async () => {
			await galleryS3.createAlbum(yearAlbum);
		});

		test("Step Function completes", async () => {
			await sleep(5000);
			await expectStateMachineToHaveCompletedSuccessfully();
		}, 8000 /* timeout after this many millis.  The default is 5000ms */);

		test("API returns album", async () => {
			await galleryApiJestHelper.expectAlbumToBeInApi(yearAlbum);
		});
	});

	/**
	 * UPDATE YEAR ALBUM
	 */
	describe("Update year album", async () => {
		const albumPath = yearAlbum;
		test("Update album title and description", async () => {
			const albumAttributes = {
				title: "Updated title " + generateRandomInt(),
				description: "Updated description " + generateRandomInt()
			};
			await galleryApiJestHelper.expectAlbumAttributesToNotMatch(
				albumPath,
				albumAttributes
			);
			await galleryApiJestHelper.updateAlbum(albumPath, albumAttributes);
			await galleryApiJestHelper.expectAlbumAttributesToMatch(
				albumPath,
				albumAttributes
			);
		});
		test("Update album title", async () => {
			const albumAttributes = {
				title: "Updated title v2 " + generateRandomInt()
			};
			await galleryApiJestHelper.expectAlbumAttributesToNotMatch(
				albumPath,
				albumAttributes
			);
			await galleryApiJestHelper.updateAlbum(albumPath, albumAttributes);
			await galleryApiJestHelper.expectAlbumAttributesToMatch(
				albumPath,
				albumAttributes
			);
		});
	});

	/**
	 * CREATE WEEK ALBUM
	 */
	describe("Create week album", async () => {
		test("Album does not exist", async () => {
			await galleryApiJestHelper.expectAlbumToNotBeInApi(weekAlbum);
		});

		test("Create album in S3", async () => {
			await galleryS3.createAlbum(weekAlbum);
		});

		test("Step Function completes", async () => {
			await sleep(5000);
			await expectStateMachineToHaveCompletedSuccessfully();
		}, 8000 /* timeout after this many millis.  The default is 5000ms */);

		test("API returns album", async () => {
			await galleryApiJestHelper.expectAlbumToBeInApi(weekAlbum);
		});
	});

	/**
	 * UPDATE WEEK ALBUM
	 */
	describe("Update week album", async () => {
		const albumPath = weekAlbum;
		test("Update album title and description", async () => {
			const albumAttributes = {
				title: "Updated title " + generateRandomInt(),
				description: "Updated description " + generateRandomInt()
			};
			await galleryApiJestHelper.expectAlbumAttributesToNotMatch(
				albumPath,
				albumAttributes
			);
			await galleryApiJestHelper.updateAlbum(albumPath, albumAttributes);
			await galleryApiJestHelper.expectAlbumAttributesToMatch(
				albumPath,
				albumAttributes
			);
		});

		test("Update album title", async () => {
			const albumAttributes = {
				title: "Updated title v2 " + generateRandomInt()
			};
			await galleryApiJestHelper.expectAlbumAttributesToNotMatch(
				albumPath,
				albumAttributes
			);
			await galleryApiJestHelper.updateAlbum(albumPath, albumAttributes);
			await galleryApiJestHelper.expectAlbumAttributesToMatch(
				albumPath,
				albumAttributes
			);
		});
	});

	/**
	 * CREATE IMAGE
	 */
	describe("Create image", async () => {
		test("Upload image to S3", async () => {
			const imagePathOnDisk = path.join(
				path.dirname(__dirname),
				"tests",
				"test_data",
				"test_image_1.jpg"
			);
			await galleryS3.uploadImage(imagePathOnDisk, imagePath);
		});

		test("Step Function completed successfully", async () => {
			await sleep(10000);
			await expectStateMachineToHaveCompletedSuccessfully();
		}, 20000 /* timeout after this many millis.  The default is 5000ms */);

		test("CloudFront returns original image", async () => {
			await expectImageToBeInCloudFront(stack.originalImagePrefix);
		});

		test("CloudFront returns thumbnail version of image", async () => {
			await expectImageToBeInCloudFront(stack.thumbnailImagePrefix);
		});

		test("CloudFront returns large version of image", async () => {
			await expectImageToBeInCloudFront(stack.largeImagePrefix);
		});

		test("API returns image", async () => {
			await galleryApiJestHelper.expectImageToBeInApi(imagePath);
		});
	});

	/**
	 * UPDATE IMAGE
	 */
	describe("Update image", async () => {
		test("Update image title and description", async () => {
			const imageAttributes = {
				title: "Updated title " + generateRandomInt(),
				description: "Updated description " + generateRandomInt()
			};
			await galleryApiJestHelper.expectImageAttributesToNotMatch(
				imageAttributes
			);
			await galleryApiJestHelper.updateImage(imagePath, imageAttributes);
			await galleryApiJestHelper.expectImageAttributesToMatch(imageAttributes);
		});

		test("Update image title", async () => {
			const imageAttributes = {
				title: "Updated title v2 " + generateRandomInt()
			};
			await galleryApiJestHelper.expectImageAttributesToNotMatch(
				imageAttributes
			);
			await galleryApiJestHelper.updateImage(imagePath, imageAttributes);
			await galleryApiJestHelper.expectImageAttributesToMatch(imageAttributes);
		});
	});

	/**
	 * DELETE IMAGE
	 */
	describe("Delete image", async () => {
		test("Delete image from S3", async () => {
			await galleryS3.deleteImage(imagePath);
		});

		test("Step Function completes", async () => {
			await sleep(5000);
			await expectStateMachineToHaveCompletedSuccessfully();
		}, 8000 /* timeout after this many millis.  The default is 5000ms */);

		//
		// I can't test that the images are gone from CloudFront because it caches them
		//

		test("Thumbnail version of image no longer in S3", async () => {
			expect(galleryS3.thumbnailExists(imagePath)).toBeFalsy();
		});

		test("Large version of image is no longer in S3", async () => {
			expect(galleryS3.largeVersionOfImageExists(imagePath)).toBeFalsy();
		});

		test("API no longer returns image", async () => {
			await galleryApiJestHelper.expectImageToNotBeInApi(imagePath);
		});
	});

	/**
	 * DELETE WEEK ALBUM
	 */
	describe("Delete week album", async () => {
		test("Delete album folder from S3", async () => {
			await galleryS3.deleteAlbum(weekAlbum);
		});

		test("Step Function completes", async () => {
			await sleep(5000);
			await expectStateMachineToHaveCompletedSuccessfully();
		}, 8000 /* timeout after this many millis.  The default is 5000ms */);

		test("API no longer returns album", async () => {
			await galleryApiJestHelper.expectAlbumToNotBeInApi(weekAlbum);
		});
	});

	/**
	 * DELETE YEAR ALBUM
	 */
	describe("Delete year album", async () => {
		test("Delete album folder from S3", async () => {
			await galleryS3.deleteAlbum(yearAlbum);
		});

		test("Step Function completes", async () => {
			await sleep(5000);
			await expectStateMachineToHaveCompletedSuccessfully();
		}, 8000 /* timeout after this many millis.  The default is 5000ms */);

		test("API no longer returns album", async () => {
			await galleryApiJestHelper.expectAlbumToNotBeInApi(yearAlbum);
		});
	});
});

/**
 * Clean up after all tests are done
 */
afterAll(async () => {
	// Delete all the albums and image
	var params = {
		Bucket: stack.originalImageBucketName,
		Delete: {
			Objects: [
				{
					Key: stack.originalImagePrefix + yearAlbum
				},
				{
					Key: stack.originalImagePrefix + weekAlbum
				},
				{
					Key: stack.originalImagePrefix + imagePath
				}
			]
		}
	};
	await s3.deleteObjects(params).promise();
});

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
 * Fail if image isn't retrievable via CloudFront
 */
async function expectImageToBeInCloudFront(imagePrefix) {
	const imageUrl = stack.cloudFrontUrl + "/" + imagePrefix + imagePath;
	const headResult = await fetch(imageUrl, { method: "HEAD" });
	expect(headResult).toBeDefined();
	if (headResult.status !== 200) {
		// eslint-disable-next-line no-console
		console.log(
			"Got " + headResult.status + " instead of 200 when hitting: " + imageUrl
		);
	}
	expect(headResult.status).toBe(200);
}

/**
 * Wait for the specified # of milliseconds
 * @param {*} ms
 */
function sleep(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

/**
 * Generate a random integer suitable for making unique filenames
 */
function generateRandomInt() {
	return Math.floor(Math.random() * 100000);
}
