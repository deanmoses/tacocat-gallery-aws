const { BadRequestException } = require("http-response-utils");
const { NotFoundException } = require("http-response-utils");
const { getParentAndNameFromPath } = require("gallery-path-utils");

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

	// These are the attributes it's valid to set on an album
	const validKeys = new Set(["title", "description", "thumbnail"]);

	// We'll be separating out the attributes to update from the attributes to
	// remove.  Setting an attribute to blank ("") isn't allowed in DynamoDB;
	// instead you have to remove it completely.
	let attributesToSet = new Set();
	let attributesToRemove = new Set();

	// For each attributes to update
	keysToUpdate.forEach(keyToUpdate => {
		// Ensure we aren't trying to update an unknown attribute
		if (!validKeys.has(keyToUpdate)) {
			throw new BadRequestException("Unknown attribute: " + keyToUpdate);
		}

		// Put the blank attributes into the 'attributesToRemove' bucket
		const value = attributesToUpdate[keyToUpdate];
		if (!value) {
			attributesToRemove.add(keyToUpdate);
		} else {
			attributesToSet.add(keyToUpdate);
		}
	});

	// Special validation for non-empty thumbnail
	if (attributesToUpdate.thumbnail) {
		assertWellFormedImagePath(attributesToUpdate.thumbnail);
	}

	//
	// Build the Dynamo DB expression
	//

	let exprVals = {};

	// Build the SET expression
	let setExpr = "";
	attributesToSet.forEach(key => {
		setExpr = addToSetExpr(setExpr, exprVals, key, attributesToUpdate[key]);
	});
	// Always set the update time
	setExpr = addToSetExpr(
		setExpr,
		exprVals,
		"updatedOn",
		new Date().toISOString()
	);

	// Build the REMOVE expression
	let removeExpr = "";
	attributesToRemove.forEach(key => {
		removeExpr = addToRemoveExpr(removeExpr, key);
	});

	// Combine the SET and REMOVE expression fragments
	let updateExpression = setExpr;
	if (removeExpr) {
		updateExpression += " " + removeExpr;
	}

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

	//
	// Generate the DynamoDB parameters
	//

	const pathParts = getParentAndNameFromPath(path);

	const dynamoParams = {
		TableName: ctx.tableName,
		Key: {
			parentPath: pathParts.parent,
			itemName: pathParts.name
		},
		UpdateExpression: updateExpression,
		ExpressionAttributeValues: exprVals,
		ConditionExpression: "attribute_exists (itemName)"
	};

	//
	// Send update to DynamoDB
	//

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

/**
 * Add to DynamoDB SET expression
 *
 * @param {String} expr
 * @param {Array} exprVals
 * @param {String} name
 * @param {String} value
 */
function addToSetExpr(expr, exprVals, name, value) {
	if (expr.length === 0) {
		expr = "SET";
	} else {
		expr += ",";
	}
	expr += " x = :x".replace(/x/g, name);
	exprVals[":" + name] = value;
	return expr;
}

/**
 * Add to DynamoDB REMOVE expression
 *
 * @param {String} expr
 * @param {String} name
 */
function addToRemoveExpr(expr, name) {
	if (expr.length === 0) {
		expr = "REMOVE";
	} else {
		expr += ",";
	}
	expr += " " + name;

	return expr;
}

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
