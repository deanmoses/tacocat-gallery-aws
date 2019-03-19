const validateImage = require("./validate_image.js");
const updateImage = require("./update_image.js");
const { getParentAndNameFromPath } = require("gallery-path-utils");
const { setImageAsAlbumThumb } = require("dynamo-utils");
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

	// Set image as the album's thumb if album doesn't have a thumb
	const albumPath = getParentAndNameFromPath(imagePath).parent;
	const albumThumbWasUpdated = await setImageAsAlbumThumb(
		ctx,
		albumPath,
		imagePath,
		now,
		false /* replaceExistingThumb */
	);

	// Return success to StepFunctions
	// This value is not used; it's just for debugging
	return albumThumbWasUpdated
		? "SUCCESS: thumb was updated"
		: "SUCCESS: thumb not updated; album already had thumb";
}
module.exports = storeImage;
