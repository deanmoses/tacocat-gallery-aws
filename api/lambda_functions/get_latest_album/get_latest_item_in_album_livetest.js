const getLatestItemInAlbum = require("./get_latest_item_in_album.js");
const AWS = require("aws-sdk");
const tableName = "TacocatGallery-GalleryItemDDBTable-79EDM1U7URHV";
const docClient = new AWS.DynamoDB.DocumentClient({
	region: "us-west-2"
});

async function get(albumPath) {
	return getLatestItemInAlbum(docClient, tableName, albumPath);
}

async function doTest() {
	const result = await get("/2001/");
	console.log("result: ", result);
	return result;
}
doTest();
