const { getParentAndNameFromPath } = require("gallery-path-utils");

/**
 * Update image in DynamoDB.
 *
 * To be called every time a new version of the image is uploaded to S3.
 *
 * @param {Object} ctx execution context
 * @param {String} imagePath Path of the image like /2001/12-31/image.jpg
 * @param {Object} metadata EXIF and IPTC metadata extracted from the image
 *
 * @returns {Object} result from DynamoDB if success, throws exception if there's a problem with the input
 */
async function updateImage(ctx, imagePath, metadata) {
	const now = new Date().toISOString();

	let expr = "";
	let exprVals = {};
	let removeExpr = "";

	expr = addToSetExpr(expr, exprVals, "updatedOn", now);
	expr = addToSetExpr(expr, exprVals, "fileUpdatedOn", now);

	if (metadata.format == undefined) {
		addToRemoveExpr(removeExpr, "mimeSubType");
	} else {
		const mimeSubType = metadata.format.toLowerCase();
		expr = addToSetExpr(expr, exprVals, "mimeSubType", mimeSubType);
	}

	if (metadata.dimensions == undefined) {
		addToRemoveExpr(removeExpr, "dimensions");
	} else {
		expr = addToSetExpr(expr, exprVals, "dimensions", metadata.dimensions);
	}

	if (metadata.creationTime == undefined) {
		addToRemoveExpr(removeExpr, "capturedOn");
	} else {
		// Don't check the date format: that was done in the transform metadata step
		expr = addToSetExpr(expr, exprVals, "capturedOn", metadata.creationTime);
	}

	if (metadata.tags == undefined) {
		addToRemoveExpr(removeExpr, "tags");
	} else {
		expr = addToSetExpr(expr, exprVals, "tags", metadata.tags);
	}

	// Combine the SET and REMOVE expression fragments
	let updateExpression = expr;
	if (removeExpr) {
		updateExpression += " " + removeExpr;
	}

	//
	// Generate the DynamoDB parameters
	//

	const pathParts = getParentAndNameFromPath(imagePath);
	const ddbparams = {
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

	await ctx.doUpdate(ddbparams);
}
module.exports = updateImage;

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
