const updateImage = require("./update_image.js");
const { NotFoundException } = require("http_utils");
const AWS = require("aws-sdk");
const tableName = "TacocatGallery-GalleryItemDDBTable-GA5UVC6VCQRQ";
const docClient = new AWS.DynamoDB.DocumentClient({
	region: "us-west-2"
});

async function test(path, attributesToUpdate) {
	return updateImage(docClient, tableName, path, attributesToUpdate);
}

async function doTest() {
	let result = await test("/2002/12-31/k_beate01.jpg", {
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
