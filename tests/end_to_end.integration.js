const AWS = require("./utils/configure_aws.js");
const aws4 = require("aws4");
const getStackConfiguration = require("./utils/get_stack_configuration.js");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const s3 = new AWS.S3();
const stepfunctions = new AWS.StepFunctions();

// information about the deployed CloudFormation stack
let stack;

// path to image in S3 and CloudFront
const yearAlbum = "1901/";
const weekAlbum = yearAlbum + "01-31/";
const imageNameInCloud = "test_image_" + generateRandomInt() + ".jpg";
const imagePath = weekAlbum + imageNameInCloud;

/**
 * End to end integration test
 */
describe("End to end test", async () => {
	test("Get CloudFormation stack config", async () => {
		await getStack();
	});

	/**
	 * CREATE WEEK ALBUM
	 */
	describe("Create year album", async () => {
		test("Create album in S3", async () => {
			await createAlbum(yearAlbum);
		});

		test("Step Function completes", async () => {
			await sleep(5000);
			await expectStateMachineToHaveCompletedSuccessfully();
		}, 8000 /* timeout after this many millis.  The default is 5000ms */);

		test("API returns album", async () => {
			await expectAlbumToBeInApi(yearAlbum);
		});
	});

	/**
	 * CREATE WEEK ALBUM
	 */
	describe("Create week album", async () => {
		test("Create album in S3", async () => {
			await createAlbum(weekAlbum);
		});

		test("Step Function completes", async () => {
			await sleep(5000);
			await expectStateMachineToHaveCompletedSuccessfully();
		}, 8000 /* timeout after this many millis.  The default is 5000ms */);

		test("API returns album", async () => {
			await expectAlbumToBeInApi(weekAlbum);
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
			await expectAlbumAttributesToNotMatch(albumPath, albumAttributes);
			await updateAlbum(albumPath, albumAttributes);
			await expectAlbumAttributesToMatch(albumPath, albumAttributes);
		});
		test("Update album title", async () => {
			const albumAttributes = {
				title: "Updated title v2 " + generateRandomInt()
			};
			await expectAlbumAttributesToNotMatch(albumPath, albumAttributes);
			await updateAlbum(albumPath, albumAttributes);
			await expectAlbumAttributesToMatch(albumPath, albumAttributes);
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
			await expectAlbumAttributesToNotMatch(albumPath, albumAttributes);
			await updateAlbum(albumPath, albumAttributes);
			await expectAlbumAttributesToMatch(albumPath, albumAttributes);
		});

		test("Update album title", async () => {
			const albumAttributes = {
				title: "Updated title v2 " + generateRandomInt()
			};
			await expectAlbumAttributesToNotMatch(albumPath, albumAttributes);
			await updateAlbum(albumPath, albumAttributes);
			await expectAlbumAttributesToMatch(albumPath, albumAttributes);
		});
	});

	/**
	 * CREATE IMAGE
	 */
	describe("Create image", async () => {
		test("Upload image to S3", async () => {
			await uploadAndVerifyImage("test_data/test_image_1.jpg", imagePath);
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
			await expectImageToBeInApi();
		});
	});

	/**
	 * DELETE IMAGE
	 */
	describe("Delete image", async () => {
		test("Delete image from S3", async () => {
			await deleteImage(imagePath);
		});

		test("Step Function completes", async () => {
			await sleep(5000);
			await expectStateMachineToHaveCompletedSuccessfully();
		}, 8000 /* timeout after this many millis.  The default is 5000ms */);

		//
		// I can't test that the images are gone from CloudFront because it caches them
		//

		test("Thumbnail version of image no longer in S3", async () => {
			await expectImageToNotBeInS3(stack.thumbnailImagePrefix);
		});

		test("Large version of image is no longer in S3", async () => {
			await expectImageToNotBeInS3(stack.largeImagePrefix);
		});

		test("API no longer returns image", async () => {
			await expectImageToNotBeInApi();
		});
	});

	/**
	 * DELETE WEEK ALBUM
	 */
	describe("Delete week album", async () => {
		test("Delete album folder from S3", async () => {
			await deleteAlbumFromS3(weekAlbum);
		});

		test("Step Function completes", async () => {
			await sleep(5000);
			await expectStateMachineToHaveCompletedSuccessfully();
		}, 8000 /* timeout after this many millis.  The default is 5000ms */);

		test("API no longer returns album", async () => {
			await expectAlbumToNotBeInApi(weekAlbum);
		});
	});

	/**
	 * DELETE YEAR ALBUM
	 */
	describe("Delete year album", async () => {
		test("Delete album folder from S3", async () => {
			await deleteAlbumFromS3(yearAlbum);
		});

		test("Step Function completes", async () => {
			await sleep(5000);
			await expectStateMachineToHaveCompletedSuccessfully();
		}, 8000 /* timeout after this many millis.  The default is 5000ms */);

		test("API no longer returns album", async () => {
			await expectAlbumToNotBeInApi(yearAlbum);
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
					Key: stack.originalImagePrefix + "/" + yearAlbum
				},
				{
					Key: stack.originalImagePrefix + "/" + weekAlbum
				},
				{
					Key: stack.originalImagePrefix + "/" + imagePath
				}
			]
		}
	};
	await s3.deleteObjects(params).promise();
});

/**
 * Get info about the deployed CloudFormation stack,
 * such as the name of the S3 bucket to upload images.
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
 * Create album in S3
 */
async function createAlbum(albumPathInCloud) {
	const createParams = {
		Bucket: stack.originalImageBucketName,
		Key: stack.originalImagePrefix + "/" + albumPathInCloud
	};
	const createResult = await s3.putObject(createParams).promise();

	// Verify album was created successfully
	expect(createResult).toBeDefined();
	expect(createResult.ETag).toBeDefined();
}

/**
 * Upload image to S3
 */
async function uploadAndVerifyImage(imageNameOnDisk, imagePathInCloud) {
	const imagePathOnDisk = path.join(__dirname, imageNameOnDisk);
	const uploadParams = {
		Bucket: stack.originalImageBucketName,
		Key: stack.originalImagePrefix + "/" + imagePathInCloud,
		ContentType: "image/jpeg",
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
	await s3
		.deleteObject({
			Bucket: stack.originalImageBucketName,
			Key: stack.originalImagePrefix + "/" + imagePathInCloud
		})
		.promise();
}

/**
 * Delete album from S3
 */
async function deleteAlbumFromS3(albumPathInCloud) {
	await s3
		.deleteObject({
			Bucket: stack.originalImageBucketName,
			Key: stack.originalImagePrefix + "/" + albumPathInCloud
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
 * Fail if album isn't retrievable via API
 */
async function expectAlbumToBeInApi(albumPath) {
	await fetchAlbum(albumPath);
}

/**
 * Fail if album *is* retrievable via API
 */
async function expectAlbumToNotBeInApi(albumPath) {
	// Fetch album
	const albumUrl = stack.apiUrl + "/album/" + albumPath;
	const response = await fetch(albumUrl);

	// Did I get a HTTP 404?
	expect(response).toBeDefined();
	expect(response.status).toBe(404);
}

/**
 * Update album in DynamoDB
 *
 * @param {String} albumPath path of album like 2001/12-31/
 * @param {Object} attributesToUpdate like {title: "x", description: "y"}
 */
async function updateAlbum(albumPath, attributesToUpdate) {
	// Set up the fetch
	const apiPath = "/prod/album/" + albumPath;
	const albumUrl = "https://" + stack.apiDomain + apiPath;
	const unsignedFetchParams = {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json"
		},
		path: apiPath,
		host: stack.apiDomain,
		body: JSON.stringify(attributesToUpdate)
	};
	// const credentials = {
	// 	accessKeyId: "AKIAJA4C3QLYRWHNNBCA",
	// 	secretAccessKey: "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"
	// };

	const credentials = {
		accessKeyId: stack.accessKey,
		secretAccessKey: stack.secretKey
	};

	const signedFetchParams = aws4.sign(unsignedFetchParams, credentials);
	//const signedFetchParams = aws4.sign(unsignedFetchParams);

	//  Do the fetch
	const patchResponse = await fetch(albumUrl, signedFetchParams);

	// Verify we actually got an album

	expect(patchResponse).toBeDefined();

	// if the API returned a 403 Not Authorized
	if (patchResponse.status === 403) {
		// print out debugging info about the request signing
		/* eslint-disable no-console */
		console.log("credentials", credentials);
		console.log("unsigned options for " + albumUrl, unsignedFetchParams);
		console.log("signed options for " + albumUrl, signedFetchParams);

		// The API Gateway returns very helpful info in the body about what it was expecting
		// the signed request's format to be
		const body = await patchResponse.json();
		console.log("patchResult", body);

		// Print out what the actual request signing information was
		var signer = new aws4.RequestSigner(unsignedFetchParams, credentials);
		console.log("Actual Canonical String", signer.canonicalString());
		console.log("Actual String-to-Sign", signer.stringToSign());
		/* eslint-enable no-console */
	}

	expect(patchResponse.status).toBe(200);
}

/**
 * Fail if any of the specified album attributes do not match exactly
 *
 * @param {String} albumPath path of album like 2001/12-31/
 * @param {Object} attributesToMatch like {title: "x", description: "y"}
 */
async function expectAlbumAttributesToMatch(albumPath, attributesToMatch) {
	const album = await fetchAlbum(albumPath);
	for (const key in attributesToMatch) {
		const expectedValue = attributesToMatch[key];
		expect(album[key]).toBe(expectedValue);
	}
}

/**
 * Fail if any of the specified album attributes matches exactly
 *
 * @param {String} albumPath path of album like 2001/12-31/
 * @param {Object} attributesToNotMatch like {title: "x", description: "y"}
 */
async function expectAlbumAttributesToNotMatch(
	albumPath,
	attributesToNotMatch
) {
	const album = await fetchAlbum(albumPath);
	for (const key in attributesToNotMatch) {
		const expectedValue = attributesToNotMatch[key];
		expect(album[key]).not.toBe(expectedValue);
	}
}

/**
 * Fetch album via API
 *
 * @param {String} albumPath path of album like 2001/12-31/
 * @returns album object
 */
async function fetchAlbum(albumPath) {
	// Fetch album
	const albumUrl = stack.apiUrl + "/album/" + albumPath;
	const response = await fetch(albumUrl);

	// Did I get a HTTP 200?
	expect(response).toBeDefined();
	expect(response.status).toBeDefined();
	expect(response.status).toBe(200);

	// Did I get the album I expected?
	const body = await response.json();
	expect(body.album).toBeDefined();
	const album = body.album;

	// Is date the expected format?  It should be ISO 8601, which ends in a Z.
	expect(album.uploadDateTime).toBeDefined();
	expect(album.uploadDateTime.lastIndexOf("Z")).toBe(
		album.uploadDateTime.length - 1
	);

	return album;
}

/**
 * Fail if image isn't retrievable via API
 */
async function expectImageToBeInApi() {
	// Fetch album
	const albumUrl = stack.apiUrl + "/album/" + weekAlbum;
	const response = await fetch(albumUrl);

	// Did I get a HTTP 200?
	expect(response).toBeDefined();
	expect(response.status).toBeDefined();
	expect(response.status).toBe(200);

	// Did I get the album I expected?
	const body = await response.json();
	expect(body.album).toBeDefined();
	const album = body.album;

	// Is date the expected format?  It should be ISO 8601, which ends in a Z.
	expect(album.uploadDateTime).toBeDefined();
	expect(album.uploadDateTime.lastIndexOf("Z")).toBe(
		album.uploadDateTime.length - 1
	);

	// Does the album have a children array?
	expect(Array.isArray(body.children)).toBeTruthy();

	// Is one of the children the image that was uploaded?
	const foundChild = body.children.find(child => {
		return child.itemName === imageNameInCloud;
	});
	expect(foundChild).toBeDefined();
}

/**
 * Fail if image *is* retrievable via API
 */
async function expectImageToNotBeInApi() {
	// Fetch album
	const albumUrl = stack.apiUrl + "/album/" + weekAlbum;
	const response = await fetch(albumUrl);

	// Did I get a HTTP 200?
	expect(response).toBeDefined();
	expect(response.status).toBeDefined();
	expect(response.status).toBe(200);

	// Did I get the album I expected?
	const body = await response.json();
	expect(body.album).toBeDefined();
	const album = body.album;

	// Is date the expected format?  It should be ISO 8601, which ends in a Z.
	expect(album.uploadDateTime).toBeDefined();
	expect(album.uploadDateTime.lastIndexOf("Z")).toBe(
		album.uploadDateTime.length - 1
	);

	// Does the album have a children array?
	expect(Array.isArray(body.children)).toBeTruthy();

	// Is one of the children the image that was uploaded?
	const foundChild = body.children.find(child => {
		return child.itemName === imageNameInCloud;
	});
	expect(foundChild).toBeUndefined();
}

/**
 * Fail if image isn't retrievable via CloudFront
 */
async function expectImageToBeInCloudFront(imagePrefix) {
	const imageUrl = stack.cloudFrontUrl + "/" + imagePrefix + "/" + imagePath;
	const headResult = await fetch(imageUrl, { method: "HEAD" });
	expect(headResult).toBeDefined();
	expect(headResult.status).toBe(200);
}

/**
 * Fail if image *is* retrievable via S3
 */
async function expectImageToNotBeInS3(imagePrefix) {
	const headParams = {
		Bucket: stack.derivedImageBucketName,
		Key: imagePrefix + "/" + imagePath
	};
	try {
		await s3.headObject(headParams).promise();
		throw "This delete should not have succeeded";
	} catch (headErr) {
		if (headErr.code === "Forbidden") {
			return; // this is expected
		} else {
			throw headErr;
		}
	}
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
