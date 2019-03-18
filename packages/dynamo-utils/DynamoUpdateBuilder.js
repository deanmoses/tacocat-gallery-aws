const isEmpty = require("./isEmpty.js");

const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient(); // just needed for constructing the set parameter correctly

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
		this.setsToUpdate = {};
	}

	/**
	 * Set this field in DynamoDB.
	 * This will result in an expression like "SET foo = :foo"
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
	 * This will result in an expression like "SET foo = if_not_exists(foo, :foo)"
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
	 * Add the item to the set.
	 * This will result in an expression like "ADD nameOfSet :itemInSet"
	 *
	 * @param {String} nameOfSetField name of set field
	 * @param {Object} itemInSet item in set
	 */
	addToSet(nameOfSetField, itemInSet) {
		if (this.setsToUpdate[nameOfSetField] == undefined) {
			this.setsToUpdate[nameOfSetField] = new Set();
		}
		this.setsToUpdate[nameOfSetField].add(itemInSet);
	}

	/**
	 * Construct the DynamoDB UpdateExpression
	 *
	 * @returns {String} such as "SET attr1 = :attr1, REMOVE attr2"
	 */
	getUpdateExpression() {
		// Build the SET
		let setExpr = "";
		for (const [name, value] of Object.entries(this.itemsToSetIfNotExists)) {
			setExpr = addToSetIfNotExistsExpr(setExpr, name, value);
		}
		for (const [name, value] of Object.entries(this.itemsToSet)) {
			setExpr = addToSetExpr(setExpr, name, value);
		}

		// Build the REMOVE
		let removeExpr = "";
		this.itemsToRemove.forEach(name => {
			removeExpr = addToRemoveExpr(removeExpr, name);
		});

		// Build the ADD
		let addExpr = "";
		for (const [name, value] of Object.entries(this.setsToUpdate)) {
			addExpr = addToAddExpr(addExpr, name, value);
		}

		// Combine SET, REMOVE and ADD
		let updateExpression = "";
		if (setExpr) {
			updateExpression = setExpr;
		}
		if (removeExpr) {
			updateExpression += " " + removeExpr;
		}
		if (addExpr) {
			updateExpression += " " + addExpr;
		}
		return updateExpression;
	}

	/**
	 * Construct the DyanmoDB ExpressionAttributeValues
	 *
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
		for (const [name, value] of Object.entries(this.setsToUpdate)) {
			exprVals[":" + name] = docClient.createSet(Array.from(value));
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
 * Add to DynamoDB SET expression with an if_not_exists() qualifier
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

/**
 * Add to DynamoDB ADD expression
 *
 * @param {String} expr
 * @param {String} name
 */
function addToAddExpr(expr, name) {
	if (expr.length === 0) {
		expr = "ADD";
	} else {
		expr += ",";
	}
	expr += " z :z".replace(/z/g, name);

	return expr;
}
