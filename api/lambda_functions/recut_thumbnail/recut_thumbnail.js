const BadRequestException = require("./BadRequestException.js");
const NotFoundException = require("./NotFoundException.js");
const gm = require("gm").subClass({ imageMagick: true }); // Enable ImageMagick integration

/**
 * Generate a thumbnail of a JPEG image stored in an AWS S3 bucket and save
 * the thumbnail back in the same S3 bucket.
 *
 * @param {*} s3 AWS S3 client
 * @param {*} s3BucketName name of the S3 bucket in which both the full size images and the thumbnails are stored
 * @param {*} originalImagePrefix the prefix location of the original images in the AWS S3 bucket, such as "albums"
 * @param {*} thumbnailImagePrefix the prefix location of the thumbnail images in the AWS S3 bucket, such as "thumbnails"
 * @param {*} imagePath path of image like /2001/12-31/image.jpg
 * @param {*} crop thumbnail crop info in the format {x:INTEGER,y:INTEGER,length:INTEGER}
 *
 * @returns {} nothing if success
 * @throws exception if there's any problem
 */
async function recutThumbnail(
	s3,
	s3BucketName,
	originalImagePrefix,
	thumbnailImagePrefix,
	imagePath,
	crop
) {
	// Validate that the body contains everything we need
	if (!crop || !crop.x || !crop.y || !crop.length) {
		throw new BadRequestException(
			"Crop must contain {x:NUMBER,y:NUMBER,length:NUMBER}"
		);
	}

	// Get the original image
	let s3Object;
	try {
		s3Object = await s3
			.getObject({
				Bucket: s3BucketName,
				Key: originalImagePrefix + imagePath
			})
			.promise();
	} catch (e) {
		if (e.code === "AccessDenied") {
			throw new NotFoundException("No such image: " + imagePath);
		} else {
			throw e;
		}
	}

	// Cut the thumbnail
	const buffer = await new Promise((resolve, reject) => {
		gm(s3Object.Body)
			.autoOrient()
			.crop(crop.length, crop.length, crop.x, crop.y)
			.resize(200, 200 + "^") // resize, ^ means overflow to get dimensions (shouldn't need it because I just cropped it to square)
			.interlace("Line") // aka JPEG Progressive
			.quality(85) // default is 75.  I'm seeing smaller files at 85!
			.noProfile() // remove EXIF, ICM, etc profile data // TODO: add copyright info
			.toBuffer("jpg", (err, buffer) => {
				if (err) {
					return reject(err);
				}
				resolve(buffer);
			});
	});

	// Write the thumbnail to S3
	await s3
		.upload({
			Bucket: s3BucketName,
			Key: thumbnailImagePrefix + imagePath,
			ContentType: "image/jpeg",
			Body: buffer
		})
		.promise();
}

module.exports = recutThumbnail;
