const validateImage = require("./validate_image.js");
const updateImage = require("./update_image.js");
//const updateAlbum = require("./update_album.js");

/**
 * An image, or a new version of an image, was uploaded to S3.
 * Update DynamoDB with that image.
 *
 * @param {Object} event the Lambda event
 * @param {Object} ctx the environmental context needed to do the work
 */
async function storeImage(event, ctx) {
	const imagePath = event.objectID;
	const imageMetadata = event.extractedMetadata;

	// Validate the image metadata
	validateImage(imageMetadata);

	// Share the same last-mod timestamp for the thumb between the image and
	// album, so that the CDN url contains the same timestamp, so that the CDN
	// uses the same cached image for both the album thumb and the image thumb.
	const now = new Date().toISOString();

	// Create or update the image
	await updateImage(ctx, imagePath, imageMetadata, now);

	// TRANSACTION: if any of these fail, they all fail
	// Set the image as the album's thumbnail if album doesn't have one
	//await setImageAsAlbumThumb(ctx, imagePath, now);
	// Tell the image that it's the album's thumb
	//await setAlbumOnImage(ctx, imagePath);

	// Return success to StepFunctions
	// This value is not used; it's just for debugging
	return "SUCCESS";
}
module.exports = storeImage;
