const { BadRequestException } = require("http-response-utils");
const { NotFoundException } = require("http-response-utils");
const { getParentAndNameFromPath } = require("gallery-path-utils");
const { DynamoUpdateBuilder } = require("dynamo-utils");

/**
 * Update an album's attributes (like title and description) in DynamoDB
 *
 * @param {Object} ctx execution context
 * @param {String} tableName Name of the table in DynamoDB containing gallery items
 * @param {String} path Path of the album to update, like /2001/12-31/
 * @param {Object} attributesToUpdate bag of attributes to update
 *
 * @returns {Object} result from DynamoDB if success, throws exception if there's a problem with the input
 */
async function updateAlbum(ctx, path, attributesToUpdate) {
	if (!path) {
		throw new BadRequestException("Must specify album");
	}

	assertWellFormedAlbumPath(path);

	if (path === "/") {
		throw new BadRequestException("Cannot update root album");
	}

	if (!attributesToUpdate) {
		throw new BadRequestException("No attributes to update");
	}

	const keysToUpdate = Object.keys(attributesToUpdate);

	if (keysToUpdate.length === 0) {
		throw new BadRequestException("No attributes to update");
	}

	// Ensure only these attributes are in the input
	const validKeys = new Set(["title", "description", "thumbnail"]);
	keysToUpdate.forEach(keyToUpdate => {
		// Ensure we aren't trying to update an unknown attribute
		if (!validKeys.has(keyToUpdate)) {
			throw new BadRequestException("Unknown attribute: " + keyToUpdate);
		}
	});

	// Validate thumbnail
	if (
		attributesToUpdate.thumbnail !== undefined &&
		attributesToUpdate.thumbnail !== ""
	) {
		assertWellFormedImagePath(attributesToUpdate.thumbnail);

		// Ensure thumbnail actually exists
		const thumbPath = attributesToUpdate.thumbnail;
		if (!(await ctx.itemExists(thumbPath))) {
			throw new BadRequestException("Thumbnail not found: " + thumbPath);
		}
	}

	//
	// Construct the DynamoDB update statement
	//

	const bldr = new DynamoUpdateBuilder();
	keysToUpdate.forEach(keyToUpdate => {
		bldr.add(keyToUpdate, attributesToUpdate[keyToUpdate]);
	});
	// Always set the update time
	bldr.add("updatedOn", new Date().toISOString());

	const pathParts = getParentAndNameFromPath(path);

	const dynamoParams = {
		TableName: ctx.tableName,
		Key: {
			parentPath: pathParts.parent,
			itemName: pathParts.name
		},
		UpdateExpression: bldr.getUpdateExpression(),
		ExpressionAttributeValues: bldr.getExpressionAttributeValues(),
		ConditionExpression: "attribute_exists (itemName)"
	};

	//
	// Send update to DynamoDB
	//

	try {
		return await ctx.doUpdate(dynamoParams);
	} catch (e) {
		if (e.toString().includes("conditional")) {
			throw new NotFoundException("Album not found: " + path);
		} else {
			throw e;
		}
	}
}

module.exports = updateAlbum;

/**
 * Throw exception if it's not a well-formed album path
 */
function assertWellFormedAlbumPath(albumPath) {
	if (!albumPath.match(/^\/(\d\d\d\d\/(\d\d-\d\d\/)?)?$/)) {
		throw new BadRequestException("Malformed album path: '" + albumPath + "'");
	}
}

/**
 * Throw exception if it's not a well-formed image path
 */
function assertWellFormedImagePath(imagePath) {
	if (!imagePath.match(/^\/\d\d\d\d\/\d\d-\d\d\/.*\..*$/)) {
		throw new BadRequestException("Malformed image path: '" + imagePath + "'");
	}
}
