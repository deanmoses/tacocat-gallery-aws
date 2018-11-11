const updateImage = require("./update_image.js");
const NotFoundException = require("./NotFoundException.js");
const AWS = require("aws-sdk");
const tableName = "TacocatGallery-ImageDDBTable-ZJH4SBCSFN4O";
const docClient = new AWS.DynamoDB.DocumentClient({
	region: "us-west-2"
});

async function test(imageId, attributesToUpdate) {
	return updateImage(docClient, tableName, imageId, attributesToUpdate);
}

async function doTest() {
	let result = await test("/2001/12-31/cross_country1.jpg", {
		title: "Something Wonderful!"
	});
	//console.log(result);

	try {
		result = await test("no such image", { title: "Something Wonderful!" });
	} catch (e) {
		if (e instanceof NotFoundException) {
			// console.log("Success: image not found");
			// console.log("httpStatusCode: ", e.httpStatusCode);
			// console.log("name: ", e.name);
		} else {
			// console.log("Some other error: ", e);
		}
	}

	return result;
}

doTest();
