//const AWS = require("aws-sdk");
// const updateImage = require("./update_image.js");
// const NotFoundException = require("./NotFoundException.js");
// const BadRequestException = require("./BadRequestException.js");

// const tableName = process.env.GALLERY_ITEM_DDB_TABLE;

// const docClient = new AWS.DynamoDB.DocumentClient({
// 	region: process.env.AWS_REGION
// });

/**
 * A Lambda function that
 */
exports.handler = async (event, context, callback) => {
	event.Records.forEach(record => {
		console.log(record);
	});
};
