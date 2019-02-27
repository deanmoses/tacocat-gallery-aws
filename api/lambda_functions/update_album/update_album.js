const generateDynamoUpdateParams = require("./update_album_query_generator.js");
const NotFoundException = require("./NotFoundException.js");
const BadRequestException = require("./BadRequestException.js");

/**
 * Update an album's attributes (like title and description) in DynamoDB
 *
 * @param {*} ctx execution context
 * @param {*} tableName Name of the table in DynamoDB containing gallery items
 * @param {*} path Path of the album to update, like /2001/12-31/
 * @param {*} attributesToUpdate bag of attributes to update
 *
 * @returns {} if success, throws exception if there's a problem with the input
 */
async function updateAlbum(ctx, path, attributesToUpdate) {
	const dynamoParams = generateDynamoUpdateParams(
		ctx.tableName,
		path,
		attributesToUpdate
	);

	// If thumbnail is one of the attributes to update
	if (
		attributesToUpdate.thumbnail !== undefined &&
		attributesToUpdate.thumbnail !== ""
	) {
		// Ensure thumbnail actually exists
		const thumbPath = attributesToUpdate.thumbnail;
		if (!(await ctx.itemExists(thumbPath))) {
			throw new BadRequestException("Thumbnail not found: " + thumbPath);
		}
	}

	try {
		return await ctx.doUpdate(dynamoParams);
	} catch (e) {
		if (e.toString().indexOf("conditional") !== -1) {
			throw new NotFoundException("Album not found: " + path);
		} else {
			throw e;
		}
	}
}

module.exports = updateAlbum;
