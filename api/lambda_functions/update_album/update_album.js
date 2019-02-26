const genQuery = require("./update_album_query_generator.js");
const NotFoundException = require("./NotFoundException.js");

/**
 * Update an album's attributes (like title and description) in DynamoDB
 *
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} tableName Name of the table in DynamoDB containing gallery items
 * @param {*} path Path of the album to update, like /2001/12-31/
 * @param {*} attributesToUpdate bag of attributes to update
 *
 * @returns {} if success, throws exception if there's a problem with the input
 */
async function updateAlbum(docClient, tableName, path, attributesToUpdate) {
	const dynamoParams = genQuery(tableName, path, attributesToUpdate);

	try {
		const result = await docClient.update(dynamoParams).promise();
		return result;
	} catch (e) {
		if (e.toString().indexOf("conditional") !== -1) {
			throw new NotFoundException("Album not found: " + path);
		} else {
			throw e;
		}
	}
}

module.exports = updateAlbum;
