const transformImageMetadata = require("./transform_image_metadata.js");

/**
 * A Lambda function that takes a bag of metadata parsed from an image via
 * gm GraphicsMagick and returns it in a more regular format that other lambdas can use.
 */
exports.handler = async event => {
	return transformImageMetadata(event);
};
