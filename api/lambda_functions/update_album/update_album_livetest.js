const updateAlbum = require("./update_album.js");
const NotFoundException = require("./NotFoundException.js");
const AWS = require("aws-sdk");
const tableName = "TacocatGallery-AlbumDDBTable-MYVMPEMDQAPV";
const docClient = new AWS.DynamoDB.DocumentClient({
	region: "us-west-2"
});

async function test(albumId, attributesToUpdate) {
	return updateAlbum(docClient, tableName, albumId, attributesToUpdate);
}

async function doTest() {
	let result = await test("/2001", { title: "Something Wonderful!" });
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