const validateImage = require("./validate_image.js");
const createImage = require("./create_image.js");
const updateImage = require("./update_image.js");

/**
 * Do the lambda's work
 *
 * @param {Object} event the Lambda event
 * @param {Object} ctx the environmental context needed to do the work
 */
async function storeImage(event, ctx) {
	const imagePath = event.objectID;
	const imageMetadata = event.extractedMetadata;

	// Validate the image metadata
	validateImage(imageMetadata);

	// Create image in DynamoDB if it doesn't exist
	await createImage(ctx, imagePath, imageMetadata);

	// Update image in DynamoDB
	await updateImage(ctx, imagePath, imageMetadata);

	// Return success to StepFunctions
	// This value is not used; it's just for debugging
	return "SUCCESS";
}
module.exports = storeImage;
