const updateAlbum = require("./update_album.js");
const NotFoundException = require("./NotFoundException.js");
const AWS = require("aws-sdk");
const tableName = "TacocatGallery-GalleryItemDDBTable-GA5UVC6VCQRQ";
const docClient = new AWS.DynamoDB.DocumentClient({
	region: "us-west-2"
});

async function test(path, attributesToUpdate) {
	return updateAlbum(docClient, tableName, path, attributesToUpdate);
}

async function doTest() {
	let result = await test("/2002/", { title: "Something Wonderful!" });
	//console.log(result);

	try {
		result = await test("no such album", { title: "Something Wonderful!" });
	} catch (e) {
		if (e instanceof NotFoundException) {
			// console.log("Success: album not found");
			// console.log("httpStatusCode: ", e.httpStatusCode);
			// console.log("name: ", e.name);
		} else {
			// console.log("Some other error: ", e);
		}
	}

	return result;
}

doTest();
