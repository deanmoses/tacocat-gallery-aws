const getParentAndNameFromPath = require("./get_parent_and_name_from_path.js");

/**
 * Update image in DynamoDB.
 *
 * To be called every time a new version of the image is uploaded to S3.
 *
 * @param {Object} ctx execution context
 * @param {String} imagePath Path of the image like /2001/12-31/image.jpg
 * @param {Boolean} imageIsNew true if the image is not being re-uploaded
 * @param {Object} metadata EXIF and IPTC metadata extracted from the image
 *
 * @returns {Object} result from DynamoDB if success, throws exception if there's a problem with the input
 */
async function updateImage(ctx, imagePath, imageIsNew, metadata) {
	const now = new Date().toISOString();

	let expr = "";
	let exprVals = {};

	expr = addToSetExpr(expr, exprVals, "updatedOn", now);
	expr = addToSetExpr(expr, exprVals, "fileUpdatedOn", now);
	const mimeSubType = metadata.format.toLowerCase();
	expr = addToSetExpr(expr, exprVals, "mimeSubType", mimeSubType);
	expr = addToSetExpr(expr, exprVals, "dimensions", metadata.dimensions);

	if (metadata.creationTime) {
		expr = addToSetExpr(expr, exprVals, "capturedOn", metadata.creationTime);
	}

	// Don't update if image is being re-uploaded
	if (imageIsNew) {
		if (metadata.title) {
			expr = addToSetExpr(expr, exprVals, "title", metadata.title);
		}

		if (metadata.description) {
			expr = addToSetExpr(expr, exprVals, "description", metadata.description);
		}
	}

	if (metadata.tags) {
		expr = addToSetExpr(expr, exprVals, "tags", metadata.tags);
	}

	const pathParts = getParentAndNameFromPath(imagePath);
	const ddbparams = {
		TableName: ctx.tableName,
		Key: {
			parentPath: pathParts.parent,
			itemName: pathParts.name
		},
		UpdateExpression: expr,
		ExpressionAttributeValues: exprVals,
		ConditionExpression: "attribute_exists (itemName)"
	};

	return await ctx.doUpdate(ddbparams);
}

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

module.exports = updateImage;
