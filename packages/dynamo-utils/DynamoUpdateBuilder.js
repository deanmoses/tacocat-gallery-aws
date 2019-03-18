const isEmpty = require("./isEmpty.js");

/**
 * Helps build a DynamoDB UpdateItem statement.
 *
 * Usage:
 * const bldr = new DynamoUpdateBuilder();
 * bldr.add("attrToUpdate", valueOfAttr)
 * const dynamoParams = {
 *		TableName: ...,
 *		Key: {
 *			...
 *		},
 *		UpdateExpression: bldr.getUpdateExpression(),
 *		ExpressionAttributeValues: bldr.getExpressionAttributeValues()
 *	}
 */
class DynamoUpdateBuilder {
	constructor() {
		this.itemsToSet = {};
		this.itemsToSetIfNotExists = {};
		// We'll be separating out the attributes to remove from the attributes to
		// update.  Setting an attribute to blank ("") isn't allowed in DynamoDB;
		// instead you have to remove it completely.
		this.itemsToRemove = new Set();
	}

	/**
	 * Set this field in DynamoDB.
	 * Will result in an expression like SET foo = :foo
	 * If the value is blank/undefined, it instead results in DELETE foo
	 *
	 * @param {String} name name of field
	 * @param {Object} value value of field
	 */
	add(name, value) {
		if (isEmpty(value)) {
			this.itemsToRemove.add(name);
		} else {
			this.itemsToSet[name] = value;
		}
	}

	/**
	 * Set this field if it doesn't already exist in DynamoDB.
	 * Will result in an expression like SET foo = if_not_exists(foo, :foo)
	 * If the value is blank/undefined, it isn't added to the command.
	 *
	 * @param {String} name name of field
	 * @param {Object} value value of field
	 */
	setIfNotExists(name, value) {
		if (!isEmpty(value)) {
			this.itemsToSetIfNotExists[name] = value;
		}
	}

	/**
	 * Build the Dynamo DB UpdateExpression
	 *
	 * @returns {String} such as "SET attr1 = :attr1, attr2 = :attr2, attr3 = if_not_exists(attr3, :attr3), REMOVE attr4"
	 */
	getUpdateExpression() {
		// Build the SET expression
		let setExpr = "";
		for (const [name, value] of Object.entries(this.itemsToSetIfNotExists)) {
			setExpr = addToSetIfNotExistsExpr(setExpr, name, value);
		}
		for (const [name, value] of Object.entries(this.itemsToSet)) {
			setExpr = addToSetExpr(setExpr, name, value);
		}

		// Build the REMOVE expression
		let removeExpr = "";
		this.itemsToRemove.forEach(name => {
			removeExpr = addToRemoveExpr(removeExpr, name);
		});

		// Combine SET and REMOVE
		let updateExpression = "";
		if (setExpr) {
			updateExpression = setExpr;
		}
		if (removeExpr) {
			updateExpression += " " + removeExpr;
		}
		return updateExpression;
	}

	/**
	 * @returns {Object}
	 */
	getExpressionAttributeValues() {
		let exprVals = {};
		for (const [name, value] of Object.entries(this.itemsToSetIfNotExists)) {
			exprVals[":" + name] = value;
		}
		for (const [name, value] of Object.entries(this.itemsToSet)) {
			exprVals[":" + name] = value;
		}
		return exprVals;
	}
}
module.exports = DynamoUpdateBuilder;

/**
 * Add to DynamoDB SET expression
 *
 * @param {String} expr
 * @param {String} name
 */
function addToSetExpr(expr, name) {
	if (expr.length === 0) {
		expr = "SET";
	} else {
		expr += ",";
	}
	expr += " z = :z".replace(/z/g, name);
	return expr;
}

/**
 * Add to DynamoDB SET expression
 *
 * @param {String} expr
 * @param {String} name
 */
function addToSetIfNotExistsExpr(expr, name) {
	if (expr.length === 0) {
		expr = "SET";
	} else {
		expr += ",";
	}
	expr += " z = if_not_exists(z, :z)".replace(/z/g, name);
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
