/**
 * Delete resized versions of an image from S3.
 *
 * @param {*} s3 AWS S3 client
 * @param {*} s3BucketName name of the S3 bucket containing the derived images
 * @param {*} thumbnailImagePrefix the key prefix of the thumbnail version of images within the S3 bucket, such as "thumb"
 * @param {*} largeImagePrefix the key prefix of the large version of images within the S3 bucket, such as "large"
 * @param {*} imagePath path of image like /2001/12-31/image.jpg
 *
 * @returns {} nothing if success
 * @throws exception if there's any problem
 */
async function deleteImageResizesFromS3(
	s3,
	s3BucketName,
	thumbnailImagePrefix,
	largeImagePrefix,
	imagePath
) {
	if (!s3) throw "Undefined s3";
	if (!s3BucketName) throw "Undefined s3BucketName";
	if (!thumbnailImagePrefix) throw "Undefined thumbnailImagePrefix";
	if (!largeImagePrefix) throw "Undefined largeImagePrefix";
	if (!imagePath) throw "Undefined imagePath";

	var params = {
		Bucket: s3BucketName,
		Delete: {
			Objects: [
				{
					Key: thumbnailImagePrefix + "/" + imagePath
				},
				{
					Key: largeImagePrefix + "/" + imagePath
				}
			],
			Quiet: false
		}
	};

	const response = await s3.deleteObjects(params).promise();
	if (response && response.Errors && response.Errors.length > 0) {
		throw response;
	} else {
		return response;
	}
}

module.exports = deleteImageResizesFromS3;
