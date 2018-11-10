const getImagesInAlbum = require("./get_images_in_album.js");
const AWS = require("aws-sdk");
const imageTableName = "TacocatGallery-ImageDDBTable-CSI5QNIP8LTW";
const docClient = new AWS.DynamoDB.DocumentClient({
	region: "us-west-2"
});

async function get(albumId) {
	return getImagesInAlbum(docClient, imageTableName, albumId);
}

async function doTest() {
	const result = await get("/2001/12-31");
	//console.log("result: ", result);
	return result;
}
doTest();
