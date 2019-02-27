const BadRequestException = require("./BadRequestException.js");
const getParentAndNameFromPath = require("./get_parent_and_name_from_path.js");

/**
 * Generate the query to update an album's attributes (like title and description) in DynamoDB
 *
 * @param {String} tableName Name of the table in DynamoDB containing gallery items
 * @param {String} albumPath Path of the album to update, like /2001/12-31/
 * @param {Object} attributesToUpdate bag of attributes to update
 *
 * @returns {} query to execute, or throws exception if there's a problem with the input
 */
function generateUpdateAlbumQuery(tableName, albumPath, attributesToUpdate) {
	if (!albumPath) {
		throw new BadRequestException("Must specify album");
	}

	if (albumPath === "/") {
		throw new BadRequestException("Cannot update root album");
	}

	if (!attributesToUpdate) {
		throw new BadRequestException("No attributes to update");
	}

	const keysToUpdate = Object.keys(attributesToUpdate);

	if (keysToUpdate.length === 0) {
		throw new BadRequestException("No attributes to update");
	}

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
		"updateDateTime",
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

	const pathParts = getParentAndNameFromPath(albumPath);

	return {
		TableName: tableName,
		Key: {
			parentPath: pathParts.parent,
			itemName: pathParts.name
		},
		UpdateExpression: updateExpression,
		ExpressionAttributeValues: exprVals,
		ConditionExpression: "attribute_exists (itemName)"
	};
}
module.exports = generateUpdateAlbumQuery;

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
 * Image path can be blank (un-setting thumbnail) or a well-formed image path
 */
function assertWellFormedImagePath(imagePath) {
	if (!imagePath.match(/^\/\d\d\d\d\/\d\d-\d\d\/.*\..*$/)) {
		throw new BadRequestException("Malformed image path: '" + imagePath + "'");
	}
}
