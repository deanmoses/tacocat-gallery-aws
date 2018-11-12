const createAlbum = require("./create_album.js");
const AWS = require("aws-sdk");
const tableName = "TacocatGallery-GalleryItemDDBTable-GA5UVC6VCQRQ";
const docClient = new AWS.DynamoDB.DocumentClient({
	region: "us-west-2"
});

async function test(albumId, attributesToUpdate) {
	return createAlbum(docClient, tableName, albumId, attributesToUpdate);
}

async function doTest() {
	let result = await test("/2004/12-31", 1012031);
	console.log(result);
	return result;
}

doTest();
