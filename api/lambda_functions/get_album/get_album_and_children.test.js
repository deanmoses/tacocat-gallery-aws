const getAlbumAndChildren = require("./get_album_and_children.js");
const AWS = require("aws-sdk");
const AWS_MOCK = require("aws-sdk-mock");

const awsRegion = "us-west-2";
const tableName = "NotARealTableName";

test("Get root album", async () => {
	expect.assertions(10);

	const albumPath = "";

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

	const result = await getAlbumAndChildren(docClient, tableName, albumPath);
	expect(result).toBeDefined();

	const album = result.album;
	expect(album).toBeDefined();
	expect(album.title).toBe("Dean, Lucie, Felix and Milo Moses");
	expect(album.itemName).toBe("/");
	expect(album.parentPath).toBe("");

	const children = result.children;
	expect(children).toBeDefined();

	expect(children[0]).toBeDefined();
	expect(children[0].ItemName).toBe("cross_country5.jpg");

	expect(children[1]).toBeDefined();
	expect(children[1].ItemName).toBe("cross_country6.jpg");

	AWS_MOCK.restore("DynamoDB.DocumentClient");
});

test("Get Images in Album", async () => {
	expect.assertions(6);

	const albumId = "/not/a/real/album";

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

	const result = await getAlbumAndChildren(docClient, tableName, albumId);
	expect(result).toBeDefined();

	expect(result.children).toBeDefined();

	expect(result.children[0]).toBeDefined();
	expect(result.children[0].ItemName).toBe("cross_country5.jpg");

	expect(result.children[1]).toBeDefined();
	expect(result.children[1].ItemName).toBe("cross_country6.jpg");

	AWS_MOCK.restore("DynamoDB.DocumentClient");
});

const mockItems = [
	{
		fileSize: "2.803MB",
		ItemName: "cross_country5.jpg",
		ItemType: "media",
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
		ItemName: "cross_country6.jpg",
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
