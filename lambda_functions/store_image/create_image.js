const getParentFromPath = require("./parent_path.js");

/**
 * Create image in DynamoDB if it has not already been created.
 *
 * I expect this to be be called every time a new version of the item is
 * uploaded to the S3 bucket, but it will do nothing every time but the
 * first.
 *
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} tableName Name of the Image table in DynamoDB
 * @param {*} imageId ID of the image in DynamoDB
 */
function createImage(docClient, tableName, imageId) {
	const dynamoImageItem = {
		imageID: imageId,
		albumID: getParentFromPath(imageId)
	};
	const ddbparams = {
		TableName: tableName,
		Item: dynamoImageItem,
		ConditionExpression: "attribute_not_exists (imageID)"
	};

	return new Promise(function(resolve, reject) {
		docClient
			.put(ddbparams)
			.promise()
			.then(data => {
				resolve(data);
			})
			.catch(err => {
				// A ConditionalCheckFailedException error means the image already
				// exists.  That's not an error.
				if (err.errorType !== "ConditionalCheckFailedException") {
					resolve("Success: image already existed");
				}
				// Every other error is a real error
				else {
					reject(err);
				}
			});
	});
}

module.exports = createImage;
