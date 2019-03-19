const chooseImageThumbnail = require("./choose_album_thumbnail.js");
const JestUtils = require("../../../tests/utils/JestUtils.js");

//
// TEST SETUP AND TEARDOWN
//

// These are created in beforeEach()
let event = {}; // The event passed into the lambda, in this case from the image processing Step Function
let ctx = {}; // The execution context set up in the lambda, contains services like DynamoDB.doUpdate()

beforeEach(() => {
	// Zero out fixtures before each run
	event = {};
	ctx = {};

	// Mock out the Lambda event to be passed into method being tested
	event.thumbForAlbums = [albumPath];

	// Mock out execution context to be passed into method being tested
	ctx.tableName = "NotARealTableName";

	// Mock out queryChildImage()
	ctx.queryChildImage = jest.fn(q => {
		expect(q).toBeDefined();
		return mockGetChildImageResponse;
	});

	// Mock out doRemoveAlbumThumb()
	ctx.doRemoveAlbumThumb = jest.fn(q => {
		expect(q).toBeDefined();
		return {};
	});

	// Mock out doTransaction()
	ctx.doTransaction = jest.fn(q => {
		expect(q).toBeDefined();
		return {};
	});
});

//
// TESTS
//

describe("Choose Album Thumbnail", () => {
	/**
	 *
	 */
	test("Empty Event: No Albums", async () => {
		expect.assertions(4);

		event = {};

		// do the update, expecting it to fail
		await expect(chooseImageThumbnail(event, ctx)).rejects.toMatch("Missing");

		// did the mocks get called?
		expect(ctx.queryChildImage).toBeCalledTimes(0);
		expect(ctx.doRemoveAlbumThumb).toBeCalledTimes(0);
		expect(ctx.doTransaction).toBeCalledTimes(0);
	});

	/**
	 *
	 */
	test("Event With Empty Albums", async () => {
		expect.assertions(4);

		event.thumbForAlbums = [];

		// do the update, expecting it to fail
		await expect(chooseImageThumbnail(event, ctx)).rejects.toMatch("empty");

		// did the mocks get called?
		expect(ctx.queryChildImage).toBeCalledTimes(0);
		expect(ctx.doRemoveAlbumThumb).toBeCalledTimes(0);
		expect(ctx.doTransaction).toBeCalledTimes(0);
	});

	/**
	 *
	 */
	test("Basic test", async () => {
		expect.assertions(30);

		// TODO: assert that updatedOn is getting set

		// mock out doTransaction()
		ctx.doTransaction = jest.fn(q => {
			// do some expects *inside* the mocked function
			expect(q).toBeDefined();
			expect(Object.keys(q).length).toBe(1);
			JestUtils.expectValidArray(q.TransactItems);
			expect(q.TransactItems.length).toBe(2);
			const albumUpdate = q.TransactItems[0].Update;
			expect(albumUpdate.TableName).toBe(ctx.tableName);
			expect(albumUpdate.Key.parentPath).toBe("/2001/");
			expect(albumUpdate.Key.itemName).toBe("12-31");
			expect(albumUpdate.UpdateExpression).toBe(
				"SET updatedOn = :updatedOn, thumbnail = :thumbnail"
			);
			expect(albumUpdate.ConditionExpression).toBe(
				"attribute_exists (itemName)"
			);
			expect(Object.keys(albumUpdate.ExpressionAttributeValues).length).toBe(2);
			JestUtils.expectValidDate(
				albumUpdate.ExpressionAttributeValues[":updatedOn"]
			);
			expect(albumUpdate.ExpressionAttributeValues[":thumbnail"].path).toBe(
				"/2001/12-31/image.jpg"
			);
			JestUtils.expectValidDate(
				albumUpdate.ExpressionAttributeValues[":thumbnail"].fileUpdatedOn
			);

			const imageUpdate = q.TransactItems[1].Update;
			expect(imageUpdate.TableName).toBe(ctx.tableName);
			expect(imageUpdate.Key.parentPath).toBe("/2001/12-31/");
			expect(imageUpdate.Key.itemName).toBe("image.jpg");
			expect(imageUpdate.UpdateExpression).toBe(
				"SET updatedOn = :updatedOn ADD thumbForAlbums :thumbForAlbums"
			);
			expect(imageUpdate.ConditionExpression).toBe(
				"attribute_exists (itemName)"
			);
			expect(Object.keys(imageUpdate.ExpressionAttributeValues).length).toBe(2);
			JestUtils.expectValidDate(
				imageUpdate.ExpressionAttributeValues[":updatedOn"]
			);
			const setValue = imageUpdate.ExpressionAttributeValues[":thumbForAlbums"];
			expect(setValue.values[0]).toBe("/2001/12-31/");

			return {};
		});

		// do the update
		const response = await chooseImageThumbnail(event, ctx);

		// did the mocks get called?
		expect(ctx.queryChildImage).toBeCalledTimes(1);
		expect(ctx.doRemoveAlbumThumb).toBeCalledTimes(0);
		expect(ctx.doTransaction).toBeCalledTimes(1);

		expect(response[albumPath]).toMatch("updated");
	});

	/**
	 *
	 */
	test("Album Has No Child Images", async () => {
		expect.assertions(7);

		// Mock out queryChildImage()
		ctx.queryChildImage = jest.fn(q => {
			expect(q).toBeDefined();
			return {
				Items: []
			};
		});

		// Mock out doRemoveAlbumThumb()
		ctx.doRemoveAlbumThumb = jest.fn(q => {
			expect(q).toBeDefined();
			expect(q.UpdateExpression).toBe(
				"SET updatedOn = :updatedOn REMOVE thumbnail"
			);

			return {};
		});

		// do the update
		const response = await chooseImageThumbnail(event, ctx);

		// did the mocks get called?
		expect(ctx.queryChildImage).toBeCalledTimes(1);
		expect(ctx.doRemoveAlbumThumb).toBeCalledTimes(1);
		expect(ctx.doTransaction).toBeCalledTimes(0);

		expect(response[albumPath]).toMatch("Removed");
	});
});

const albumPath = "/2001/12-31/";
const updatedOn = "2019-03-03T06:37:33.297Z";
const mockGetChildImageResponse = {
	Items: [
		{
			itemName: "image.jpg",
			fileUpdatedOn: updatedOn
		}
	]
};
