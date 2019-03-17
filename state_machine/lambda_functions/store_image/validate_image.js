/**
 * Validate we have the minimum required image metdata
 *
 * @param {Object} imageMetadata the image EXIF and IPTC metadata extracted from the camera
 */
function validateImage(imageMetadata) {
	if (!imageMetadata) {
		throw "Missing all image metadata";
	}
	if (!imageMetadata.format) {
		throw "Missing image format";
	}
	if (!imageMetadata.dimensions) {
		throw "Missing image dimensions";
	}
}
module.exports = validateImage;
