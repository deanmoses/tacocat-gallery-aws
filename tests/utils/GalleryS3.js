const AWS = require("./configure_aws.js");
const s3 = new AWS.S3();
const fs = require("fs");
const assert = require("assert");
const PathUtils = require("./PathUtils.js");

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
		PathUtils.assertIsAlbumPath(albumPath);

		const createParams = {
			Bucket: this.stack.originalImageBucketName,
			Key: this.stack.originalImagePrefix + albumPath
		};
		const createResult = await s3.putObject(createParams).promise();

		console.log("createAlbum params: ", createParams);

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
		PathUtils.assertIsImagePath(imagePathInCloud);

		fs.access(imagePathOnDisk, fs.constants.F_OK, err => {
			if (err) throw imagePathOnDisk + " does not exist";
		});

		fs.access(imagePathOnDisk, fs.constants.R_OK, err => {
			if (err) throw imagePathOnDisk + " is not readable";
		});

		const uploadParams = {
			Bucket: this.stack.originalImageBucketName,
			Key: this.stack.originalImagePrefix + imagePathInCloud,
			ContentType: "image/jpeg",
			Body: fs.createReadStream(imagePathOnDisk)
		};
		const uploadResult = await s3.upload(uploadParams).promise();

		console.log("image uploadParams: ", uploadParams);

		assert(!!uploadResult, "uploadResult not defined");
		assert(!!uploadResult.Location, "uploadResult.Location not defined");
		assert(
			uploadResult.Location.indexOf(imagePathInCloud) >= 0,
			"uploadResult.Location doesn't contain " + imagePathInCloud
		);
	}

	/**
	 * Delete image from S3 bucket of original images
	 *
	 * @param {String} imagePath like "/2001/12-31/image.jpg"
	 */
	async deleteImage(imagePath) {
		assert(!!imagePath, "imagePath not defined");
		PathUtils.assertIsImagePath(imagePath);

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
	 * @param {String} albumPath like "/2001/12-31"
	 */
	async deleteAlbum(albumPath) {
		assert(!!albumPath, "albumPath not defined");
		PathUtils.assertIsAlbumPath(albumPath);

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
	 * @param {String} albumPath like "/2001/12-31"
	 * @returns true if album folder exists in the S3 bucket of originals
	 */
	async albumExists(albumPath) {
		assert(!!albumPath, "albumPath not defined");
		PathUtils.assertIsAlbumPath(albumPath);

		return this.objectExists(
			this.stack.originalImageBucketName,
			this.stack.originalImagePrefix + "/" + albumPath
		);
	}

	/**
	 * True if image exists
	 *
	 * @param {String} imagePath like "/2001/12-31/image.jpg"
	 * @returns true if image exists in the S3 bucket of originals
	 */
	async imageExists(imagePath) {
		PathUtils.assertIsImagePath(imagePath);

		return this.objectExists(
			this.stack.originalImageBucketName,
			this.stack.originalImagePrefix + "/" + imagePath
		);
	}

	/**
	 * True if thumbnail version of image exists
	 *
	 * @param {String} imagePath like "/2001/12-31/image.jpg"
	 */
	async thumbnailExists(imagePrefix, imagePath) {
		PathUtils.assertIsImagePath(imagePath);

		return this.objectExists(
			this.stack.derivedImageBucketName,
			this.stack.thumbnailImagePrefix + "/" + imagePath
		);
	}

	/**
	 * True if large version of image exists
	 *
	 * @param {String} imagePath like "/2001/12-31/image.jpg"
	 */
	async largeVersionOfImageExists(imagePrefix, imagePath) {
		PathUtils.assertIsImagePath(imagePath);

		return this.objectExists(
			this.stack.derivedImageBucketName,
			this.stack.largeImagePrefix + "/" + imagePath
		);
	}

	/**
	 * True if object exists
	 *
	 * @param {String} bucket
	 * @param {String} key
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
