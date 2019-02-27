const BadRequestException = require("./BadRequestException.js");
const getParentAndNameFromPath = require("./get_parent_and_name_from_path.js");

/**
 * Generate the query to update an album's attributes (like title and description) in DynamoDB
 *
 * @param {String} tableName Name of the table in DynamoDB containing gallery items
 * @param {String} path Path of the album to update, like /2001/12-31/
 * @param {Object} attributesToUpdate bag of attributes to update
 *
 * @returns {} query to execute, or throws exception if there's a problem with the input
 */
function generateUpdateAlbumQuery(tableName, path, attributesToUpdate) {
	if (!path) {
		throw new BadRequestException("Must specify album");
	}

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

	const validKeys = new Set(["title", "description", "thumbnail"]);

	// Check for unknown keys
	keysToUpdate.forEach(keyToUpdate => {
		if (!validKeys.has(keyToUpdate)) {
			throw new BadRequestException("Unknown attribute: " + keyToUpdate);
		}
	});

	//
	// Build the Dynamo DB expression
	//

	let expr = "";
	let exprVals = {};

	validKeys.forEach(key => {
		expr = addToExpr(expr, exprVals, key, attributesToUpdate[key]);
	});

	// Sanity check
	if (Object.keys(exprVals).length === 0) {
		throw new BadRequestException("No attributes to update");
	}

	if (attributesToUpdate.thumbnail !== undefined) {
		assertWellFormedImagePath(attributesToUpdate.thumbnail);
	}

	expr = addToExpr(expr, exprVals, "updateDateTime", new Date().toISOString());

	const pathParts = getParentAndNameFromPath(path);

	return {
		TableName: tableName,
		Key: {
			parentPath: pathParts.parent,
			itemName: pathParts.name
		},
		UpdateExpression: expr,
		ExpressionAttributeValues: exprVals,
		ConditionExpression: "attribute_exists (itemName)"
	};
}
module.exports = generateUpdateAlbumQuery;

function addToExpr(expr, exprVals, name, value) {
	if (value !== undefined) {
		if (expr.length === 0) {
			expr = "SET";
		} else {
			expr += ",";
		}
		expr += " x = :x".replace(/x/g, name);
		exprVals[":" + name] = value;
	}
	return expr;
}

/**
 *
 */
function assertWellFormedImagePath(imagePath) {
	if (!imagePath.match(/\/\d\d\d\d\/\d\d-\d\d\/.*\..*/)) {
		throw new BadRequestException("Malformed image path: " + imagePath);
	}
}
