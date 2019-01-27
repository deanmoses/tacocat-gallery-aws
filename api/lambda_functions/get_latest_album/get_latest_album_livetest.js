const getLatestAlbum = require("./get_latest_album.js");
const AWS = require("aws-sdk");
const tableName = "TacocatGallery-GalleryItemDDBTable-79EDM1U7URHV";
const docClient = new AWS.DynamoDB.DocumentClient({
	region: "us-west-2"
});

async function get() {
	return getLatestAlbum(docClient, tableName);
}

async function doTest() {
	const result = await get();
	console.log("result: ", result);
	return result;
}
doTest();
