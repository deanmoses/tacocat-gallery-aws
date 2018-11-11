const getChildImages = require("./get_child_images.js");
const AWS = require("aws-sdk");
const imageTableName = "TacocatGallery-ImageDDBTable-CSI5QNIP8LTW";
const docClient = new AWS.DynamoDB.DocumentClient({
	region: "us-west-2"
});

async function get(albumId) {
	return getChildImages(docClient, imageTableName, albumId);
}

async function doTest() {
	const result = await get("/2001/12-31");
	//console.log("result: ", result);
	return result;
}
doTest();
