const getAlbumAndChildren = require("./get_album_and_children.js");
const AWS = require("aws-sdk");
const tableName = "TacocatGallery-GalleryItemDDBTable-79EDM1U7URHV";
const docClient = new AWS.DynamoDB.DocumentClient({
	region: "us-west-2"
});

async function get(albumId) {
	return getAlbumAndChildren(docClient, tableName, albumId);
}

async function doTest() {
	get("2001")
		.then(result => {
			console.log("result: ", result);
			return result;
		})
		.catch(err => {
			console.log("exception: ", err);
		});
}
doTest();
