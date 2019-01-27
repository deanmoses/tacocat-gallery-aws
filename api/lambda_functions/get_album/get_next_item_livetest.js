const getNextItem = require("./get_next_item.js");
const AWS = require("aws-sdk");
const tableName = "TacocatGallery-GalleryItemDDBTable-79EDM1U7URHV";
const docClient = new AWS.DynamoDB.DocumentClient({
	region: "us-west-2"
});

async function get(albumPath) {
	return getNextItem(docClient, tableName, albumPath);
}

async function doTest() {
	const result = await get("/2001/12-31/IMG_2886.jpg");
	console.log("result: ", result);
	return result;
}
doTest();

async function doTest2() {
	const result = await get("/2001/12-31/foody_fah.jpg");
	console.log("result: ", result);
	return result;
}
doTest2();
