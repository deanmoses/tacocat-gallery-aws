const getChildAlbums = require("./list_albums.js");
const AWS = require("aws-sdk");
const tableName = "TacocatGallery-AlbumDDBTable-TO4F2IBSWJLE";
const docClient = new AWS.DynamoDB.DocumentClient({
	region: "us-west-2"
});

async function list(albumId) {
	return getChildAlbums(docClient, tableName, albumId);
}

async function c() {
	const result = await list("/2001");
	//console.log(result);
	return result;
}

c();
