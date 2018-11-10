const getAlbumAndChildren = require("./get_album_and_children.js");
const AWS = require("aws-sdk");
const albumTableName = "TacocatGallery-AlbumDDBTable-MYVMPEMDQAPV";
const imageTableName = "TacocatGallery-ImageDDBTable-ZJH4SBCSFN4O";
const docClient = new AWS.DynamoDB.DocumentClient({
	region: "us-west-2"
});

async function get(albumId) {
	return getAlbumAndChildren(
		docClient,
		albumTableName,
		imageTableName,
		albumId
	);
}

async function doTest() {
	const result = await get("2001");
	//console.log("result: ", result);
	return result;
}
doTest();
