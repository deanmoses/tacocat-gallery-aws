const createImage = require("./create_image.js");
const AWS = require("aws-sdk");
const tableName = "TacocatGallery-GalleryItemDDBTable-GA5UVC6VCQRQ";
const docClient = new AWS.DynamoDB.DocumentClient({
	region: "us-west-2"
});

async function test(imagePath, timestamp) {
	return createImage(docClient, tableName, imagePath, timestamp);
}

async function doTest() {
	let result = await test("/2004/12-31/image2.jpg", 1012031);
	//console.log(result);
	return result;
}

doTest();
