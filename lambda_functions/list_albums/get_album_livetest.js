const getAlbum = require("./get_album.js");
const AWS = require("aws-sdk");
const tableName = "TacocatGallery-AlbumDDBTable-TO4F2IBSWJLE";
const docClient = new AWS.DynamoDB.DocumentClient({
	region: "us-west-2"
});

async function get(albumId) {
	return getAlbum(docClient, tableName, albumId);
}

async function doTest() {
	const result = await get("200111");
	//console.log("result: ", result);
	return result;
}
doTest();
