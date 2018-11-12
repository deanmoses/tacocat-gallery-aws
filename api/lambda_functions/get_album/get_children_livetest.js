const getChildren = require("./get_children.js");
const AWS = require("aws-sdk");
const tableName = "TacocatGallery-GalleryItemDDBTable-GA5UVC6VCQRQ";
const docClient = new AWS.DynamoDB.DocumentClient({
	region: "us-west-2"
});

async function list(albumPath) {
	return getChildren(docClient, tableName, albumPath);
}

async function doTest() {
	const result = await list("/2002/12-31/");
	//console.log(result);
	return result;
}

doTest();
