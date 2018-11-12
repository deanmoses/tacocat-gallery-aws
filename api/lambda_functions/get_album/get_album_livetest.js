const getAlbum = require("./get_album.js");
const AWS = require("aws-sdk");
const tableName = "TacocatGallery-GalleryItemDDBTable-GA5UVC6VCQRQ";
const docClient = new AWS.DynamoDB.DocumentClient({
	region: "us-west-2"
});

async function get(albumId) {
	return getAlbum(docClient, tableName, albumId);
}

async function doTest() {
	const result = await get("2002");
	//console.log("result: ", result);
	return result;
}
doTest();
