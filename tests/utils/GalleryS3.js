const AWS = require("./configure_aws.js");
const s3 = new AWS.S3();
const fs = require("fs");
const assert = require("assert");

/**
 * Class to simplify working with Gallery images and folders in S3
 */
class GalleryS3 {
	/**
	 * @param {Object} stack something like {apiUrl: "", ...}
	 */
	constructor(stack) {
		this.stack = stack;
	}

	/**
	 * Create album in S3
	 *
	 * @param {String} albumPath like "/2001" or "/2001/12-31"
	 */
	async createAlbum(albumPath) {
		assert(!!albumPath, "albumPath not defined");

		const createParams = {
			Bucket: this.stack.originalImageBucketName,
			Key: this.stack.originalImagePrefix + "/" + albumPath
		};
		const createResult = await s3.putObject(createParams).promise();

		assert(!!createResult, "createResult not defined");
		assert(!!createResult.ETag, "createResult.ETag not defined");
	}

	/**
	 * Upload image to S3
	 *
	 * @param {String} imagePathOnDisk absolute path to image on local filesystem
	 * @param {String} imagePathInCloud like "/2001/12-31/image.jpg"
	 */
	async uploadImage(imagePathOnDisk, imagePathInCloud) {
		assert(!!imagePathOnDisk, "imagePathOnDisk not defined");
		assert(!!imagePathInCloud, "imagePathInCloud not defined");

		const uploadParams = {
			Bucket: this.stack.originalImageBucketName,
			Key: this.stack.originalImagePrefix + "/" + imagePathInCloud,
			ContentType: "image/jpeg",
			Body: fs.createReadStream(imagePathOnDisk)
		};
		const uploadResult = await s3.upload(uploadParams).promise();

		assert(!!uploadResult, "uploadResult not defined");
		assert(!!uploadResult.Location, "uploadResult.Location not defined");
		assert(
			uploadResult.Location.indexOf(imagePathInCloud) >= 0,
			"uploadResult.Location doesn't contain " + imagePathInCloud
		);
	}

	/**
	 * Delete image from S3
	 *
	 * @param {*} imagePath like "/2001/12-31/image.jpg"
	 */
	async deleteImage(imagePath) {
		assert(!!imagePath, "imagePath not defined");
		await s3
			.deleteObject({
				Bucket: this.stack.originalImageBucketName,
				Key: this.stack.originalImagePrefix + "/" + imagePath
			})
			.promise();
	}

	/**
	 * Delete album from S3
	 *
	 * @param {*} albumPath like "/2001/12-31"
	 */
	async deleteAlbum(albumPath) {
		assert(!!albumPath, "albumPath not defined");
		await s3
			.deleteObject({
				Bucket: this.stack.originalImageBucketName,
				Key: this.stack.originalImagePrefix + "/" + albumPath
			})
			.promise();
	}

	/**
	 * True if album exists
	 *
	 * @param {*} albumPath like "/2001/12-31"
	 * @returns true if album folder exists in the S3 bucket of originals
	 */
	async albumExists(albumPath) {
		assert(!!albumPath, "albumPath not defined");
		return this.objectExists(
			this.stack.originalImageBucketName,
			this.stack.originalImagePrefix + "/" + albumPath
		);
	}

	/**
	 * True if image exists
	 *
	 * @param {*} imagePath like "/2001/12-31/image.jpg"
	 * @returns true if image exists in the S3 bucket of originals
	 */
	async imageExists(imagePath) {
		return this.objectExists(
			this.stack.originalImageBucketName,
			this.stack.originalImagePrefix + "/" + imagePath
		);
	}

	/**
	 * True if object exists
	 *
	 * @param {*} bucket
	 * @param {*} key
	 * @returns true if the item exists in S3
	 */
	async objectExists(bucket, key) {
		const headParams = {
			Bucket: bucket,
			Key: key
		};
		try {
			await s3.headObject(headParams).promise();
			return true;
		} catch (headErr) {
			// Forbidden means not found
			if (headErr.code === "Forbidden") {
				return false;
			} else {
				throw headErr;
			}
		}
	}
}
module.exports = GalleryS3;
