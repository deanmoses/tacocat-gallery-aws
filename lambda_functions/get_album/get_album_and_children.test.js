const getAlbumAndChildren = require("./get_album_and_children.js");
const AWS = require("aws-sdk");
const AWS_MOCK = require("aws-sdk-mock");
const awsRegion = "us-west-2";
const albumTableName = "NotARealTableName";
const imageTableName = "NotARealTableName";
const albumId = "/not/a/real/album";

test("Get Images in Album", async () => {
	expect.assertions(9);

	// Mock out the AWS 'get' method
	const mockGetResponse = {
		Item: { albumID: "/2001", uploadTimeStamp: 1541787209 }
	};
	AWS_MOCK.mock("DynamoDB.DocumentClient", "get", mockGetResponse);

	// Mock out the AWS 'query' method.  Used to return both the child images and the child albums
	const mockQueryResponse = {
		Items: mockItems,
		Count: 3,
		ScannedCount: 3
	};
	AWS_MOCK.mock("DynamoDB.DocumentClient", "query", mockQueryResponse);

	// Create the AWS service *after* the service method has been mocked
	const docClient = new AWS.DynamoDB.DocumentClient({
		region: awsRegion
	});

	const result = await getAlbumAndChildren(
		docClient,
		albumTableName,
		imageTableName,
		albumId
	);
	expect(result).toBeDefined();

	expect(result.album).toBeDefined();
	expect(result.album.albumID).toBe("/2001");

	expect(result.childAlbums).toBeDefined();
	expect(result.childAlbums[0]).toBeDefined();
	expect(result.childAlbums[0].imageID).toBeDefined();

	expect(result.childImages).toBeDefined();
	expect(result.childImages[0]).toBeDefined();
	expect(result.childImages[0].imageID).toBe("2001/12-31/cross_country5.jpg");

	AWS_MOCK.restore("DynamoDB.DocumentClient");
});

const mockItems = [
	{
		fileSize: "2.803MB",
		imageID: "2001/12-31/cross_country5.jpg",
		imageFormat: "JPEG",
		creationTime: "2018:11:03 16:25:41",
		dimensions: { width: 4032, height: 3024 },
		uploadTime: 1541788980,
		exifMake: "Apple",
		exifModel: "iPhone 6s",
		thumbnail: [
			[Object],
			[Object],
			[Object],
			[Object],
			[Object],
			[Object],
			[Object],
			[Object],
			[Object],
			[Object]
		],
		albumID: "/2001/12-31",
		tags: [
			"Person",
			"Human",
			"Clothing",
			"Shorts",
			"Crowd",
			"People",
			"Audience",
			"Festival",
			"Shoe",
			"Footwear"
		]
	},
	{
		fileSize: "1.845MB",
		imageID: "2001/12-31/cross_country6.jpg",
		imageFormat: "JPEG",
		creationTime: "2018:11:03 16:26:04",
		dimensions: { width: 4032, height: 3024 },
		uploadTime: 1541788981,
		exifMake: "Apple",
		exifModel: "iPhone 6s",
		thumbnail: [
			[Object],
			[Object],
			[Object],
			[Object],
			[Object],
			[Object],
			[Object],
			[Object],
			[Object],
			[Object]
		],
		albumID: "/2001/12-31",
		tags: [
			"Person",
			"Clothing",
			"Electronics",
			"Sitting",
			"Furniture",
			"Table",
			"Photographer",
			"Tripod",
			"Desk",
			"Wood"
		]
	},
	{
		fileSize: "4.29MB",
		imageID: "2001/12-31/cross_country7.jpg",
		imageFormat: "JPEG",
		creationTime: "2018:11:03 16:47:56",
		dimensions: { width: 4032, height: 3024 },
		uploadTime: 1541788981,
		exifMake: "Apple",
		exifModel: "iPhone 6s",
		thumbnail: [
			[Object],
			[Object],
			[Object],
			[Object],
			[Object],
			[Object],
			[Object],
			[Object],
			[Object]
		],
		albumID: "/2001/12-31",
		tags: [
			"Person",
			"Human",
			"Sports",
			"Sport",
			"Cross Country",
			"People",
			"Crowd",
			"Apparel",
			"Clothing"
		]
	}
];
