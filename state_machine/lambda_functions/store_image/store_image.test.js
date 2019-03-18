const storeImage = require("./store_image.js");
const JestUtils = require("../../../tests/utils/JestUtils.js");

// Execution context: stuff passed into method being tested
// Created in beforeEach()
let event;
let ctx;

//
// TEST SETUP AND TEARDOWN
//

beforeEach(() => {
	// Mock out the Lambda event to be passed into method being tested
	event = {
		objectID: "/2001/12-31/image.jpg",
		extractedMetadata: minimumMetadata
	};

	// Mock out an execution context to be passed into method being tested
	ctx = {
		tableName: "NotARealTableName"
	};

	// Mock out doTransaction()
	const mockDoTransaction = jest.fn(q => {
		expect(q).toBeDefined();
		return {};
	});
	ctx.doTransaction = mockDoTransaction;

	// Mock out doUpdate()
	const mockDoUpdate = jest.fn();
	mockDoUpdate.mockReturnValue({}); // Will return empty object {}
	ctx.doUpdate = mockDoUpdate;
});

describe("Store Image", () => {
	/**
	 *
	 */
	test("Empty Image Metadata", async () => {
		expect.assertions(3);

		event.extractedMetadata = {};

		// do the update, expecting it to fail with the error message thrown above
		await expect(storeImage(event, ctx)).rejects.toMatch("Missing");

		// did the mocks get called?
		expect(ctx.doTransaction).toBeCalledTimes(0);
		expect(ctx.doUpdate).toBeCalledTimes(0);
	});

	/**
	 *
	 */
	test("Missing Image Dimensions", async () => {
		expect.assertions(3);

		event.extractedMetadata = {
			fileSize: "2.136MB",
			format: "JPEG"
		};

		// do the update, expecting it to fail with the error message thrown above
		await expect(storeImage(event, ctx)).rejects.toMatch("dimensions");

		// did the mocks get called?
		expect(ctx.doTransaction).toBeCalledTimes(0);
		expect(ctx.doUpdate).toBeCalledTimes(0);
	});

	/**
	 *
	 */
	test("Missing Image Format", async () => {
		expect.assertions(3);

		event.extractedMetadata = {
			dimensions: {
				width: 4032,
				height: 3024
			},
			fileSize: "2.136MB"
		};

		// do the update, expecting it to fail with the error message thrown above
		await expect(storeImage(event, ctx)).rejects.toMatch("format");

		// did the mocks get called?
		expect(ctx.doTransaction).toBeCalledTimes(0);
		expect(ctx.doUpdate).toBeCalledTimes(0);
	});

	/**
	 *
	 */
	test("Minimum Image Metadata", async () => {
		expect.assertions(43);

		// mock out doTransaction()
		const mockDoTransaction = jest.fn(q => {
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
				"(attribute_exists (itemName) and attribute_not_exists (thumbnail))"
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
		ctx.doTransaction = mockDoTransaction;

		// mock out doUpdate()
		const mockDoUpdate = jest.fn(q => {
			// do some expects *inside* the mocked function
			expect(q).toBeDefined();
			expect(q.TableName).toBe(ctx.tableName);
			expect(q.Key.parentPath).toBe("/2001/12-31/");
			expect(q.Key.itemName).toBe("image.jpg");
			expect(q.UpdateExpression).toBe(
				"SET itemType = if_not_exists(itemType, :itemType), createdOn = if_not_exists(createdOn, :createdOn), updatedOn = :updatedOn, fileUpdatedOn = :fileUpdatedOn, mimeSubType = :mimeSubType, dimensions = :dimensions REMOVE capturedOn, tags"
			);
			expect(Object.keys(q.ExpressionAttributeValues).length).toBe(6);
			expect(q.ExpressionAttributeValues[":itemType"]).toBe("media");
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":createdOn"]);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":updatedOn"]);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":fileUpdatedOn"]);
			expect(q.ExpressionAttributeValues[":mimeSubType"]).toBe("jpeg");
			expect(q.ExpressionAttributeValues[":dimensions"].height).toBe(3024);
			return {};
		});
		ctx.doUpdate = mockDoUpdate;

		// do the update
		const response = await storeImage(event, ctx);

		// did the mocks get called?
		expect(ctx.doTransaction).toBeCalledTimes(1);
		expect(ctx.doUpdate).toBeCalledTimes(1);

		expect(response).toBe("SUCCESS");
	});

	/**
	 *
	 */
	test("Metadata With Title and Description", async () => {
		expect.assertions(19);

		event.extractedMetadata = metadata;

		// mock out doUpdate()
		const mockDoUpdate = jest.fn(q => {
			// do some expects *inside* the mocked function
			expect(q).toBeDefined();
			expect(q.TableName).toBe(ctx.tableName);
			expect(q.Key.parentPath).toBe("/2001/12-31/");
			expect(q.Key.itemName).toBe("image.jpg");
			expect(q.UpdateExpression).toBe(
				"SET itemType = if_not_exists(itemType, :itemType), createdOn = if_not_exists(createdOn, :createdOn), title = if_not_exists(title, :title), description = if_not_exists(description, :description), updatedOn = :updatedOn, fileUpdatedOn = :fileUpdatedOn, mimeSubType = :mimeSubType, dimensions = :dimensions, capturedOn = :capturedOn, tags = :tags"
			);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":updatedOn"]);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":fileUpdatedOn"]);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":capturedOn"]);
			expect(q.ExpressionAttributeValues[":mimeSubType"]).toBe("jpeg");
			expect(q.ExpressionAttributeValues[":dimensions"]).toBe(
				metadata.dimensions
			);
			expect(q.ExpressionAttributeValues[":tags"]).toBe(metadata.tags);
			expect(Object.keys(q.ExpressionAttributeValues).length).toBe(10);
			return {};
		});
		ctx.doUpdate = mockDoUpdate;

		// do the update
		const response = await storeImage(event, ctx);

		// did the mocks get called?
		expect(ctx.doTransaction).toBeCalledTimes(1);
		expect(ctx.doUpdate).toBeCalledTimes(1);

		expect(response).toBe("SUCCESS");
	});

	/**
	 *
	 */
	test("Title and Description Are Present But Blank", async () => {
		expect.assertions(16);

		event.extractedMetadata = blankTitleMetadata;

		// mock out doUpdate()
		const mockDoUpdate = jest.fn(q => {
			// do some expects *inside* the mocked function
			expect(q).toBeDefined();
			expect(q.TableName).toBe(ctx.tableName);
			expect(q.Key.parentPath).toBe("/2001/12-31/");
			expect(q.Key.itemName).toBe("image.jpg");
			expect(q.UpdateExpression).toBe(
				"SET itemType = if_not_exists(itemType, :itemType), createdOn = if_not_exists(createdOn, :createdOn), updatedOn = :updatedOn, fileUpdatedOn = :fileUpdatedOn, mimeSubType = :mimeSubType, dimensions = :dimensions REMOVE capturedOn, tags"
			);
			expect(Object.keys(q.ExpressionAttributeValues).length).toBe(6);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":updatedOn"]);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":fileUpdatedOn"]);
			expect(q.ExpressionAttributeValues[":mimeSubType"]).toBe("jpeg");
			expect(q.ExpressionAttributeValues[":dimensions"].height).toBe(3024);
			return {};
		});
		ctx.doUpdate = mockDoUpdate;

		// do the update
		const response = await storeImage(event, ctx);

		// did the mocks get called?
		expect(ctx.doTransaction).toBeCalledTimes(1);
		expect(ctx.doUpdate).toBeCalledTimes(1);

		expect(response).toBe("SUCCESS");
	});

	/**
	 *
	 */
	test("Metadata Without Tags or CreationTime", async () => {
		expect.assertions(18);

		event.extractedMetadata = metadataWithoutTagsOrCreationTime;

		// mock out doUpdate()
		const mockDoUpdate = jest.fn(q => {
			// do some expects *inside* the mocked function
			expect(q).toBeDefined();
			expect(q.TableName).toBe(ctx.tableName);
			expect(q.Key.parentPath).toBe("/2001/12-31/");
			expect(q.Key.itemName).toBe("image.jpg");
			expect(q.UpdateExpression).toBe(
				"SET itemType = if_not_exists(itemType, :itemType), createdOn = if_not_exists(createdOn, :createdOn), updatedOn = :updatedOn, fileUpdatedOn = :fileUpdatedOn, mimeSubType = :mimeSubType, dimensions = :dimensions REMOVE capturedOn, tags"
			);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":updatedOn"]);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":fileUpdatedOn"]);
			expect(q.ExpressionAttributeValues[":capturedOn"]).toBeUndefined();
			expect(q.ExpressionAttributeValues[":tags"]).toBeUndefined();
			expect(q.ExpressionAttributeValues[":mimeSubType"]).toBe("jpeg");
			expect(q.ExpressionAttributeValues[":dimensions"]).toBe(
				metadataWithoutTagsOrCreationTime.dimensions
			);
			expect(Object.keys(q.ExpressionAttributeValues).length).toBe(6);
			return {};
		});
		ctx.doUpdate = mockDoUpdate;

		// do the update
		const response = await storeImage(event, ctx);

		// did the mocks get called?
		expect(ctx.doTransaction).toBeCalledTimes(1);
		expect(ctx.doUpdate).toBeCalledTimes(1);

		expect(response).toBe("SUCCESS");
	});

	/**
	 *
	 */
	test("Metadata With CreationTime", async () => {
		expect.assertions(16);

		event.extractedMetadata.creationTime = "2018-12-31T13:03:15.000Z";

		// mock out doUpdate()
		const mockDoUpdate = jest.fn(q => {
			// do some expects *inside* the mocked function
			expect(q).toBeDefined();
			expect(q.TableName).toBe(ctx.tableName);
			expect(q.Key.parentPath).toBe("/2001/12-31/");
			expect(q.Key.itemName).toBe("image.jpg");
			expect(q.UpdateExpression).toBe(
				"SET itemType = if_not_exists(itemType, :itemType), createdOn = if_not_exists(createdOn, :createdOn), updatedOn = :updatedOn, fileUpdatedOn = :fileUpdatedOn, mimeSubType = :mimeSubType, dimensions = :dimensions, capturedOn = :capturedOn REMOVE tags"
			);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":updatedOn"]);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":fileUpdatedOn"]);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":capturedOn"]);
			expect(Object.keys(q.ExpressionAttributeValues).length).toBe(7);
			return {};
		});
		ctx.doUpdate = mockDoUpdate;

		// do the update
		const response = await storeImage(event, ctx);

		// did the mocks get called?
		expect(ctx.doTransaction).toBeCalledTimes(1);
		expect(ctx.doUpdate).toBeCalledTimes(1);

		expect(response).toBe("SUCCESS");
	});

	/**
	 *
	 */
	test("Image Already Exists", async () => {
		expect.assertions(14);

		// mock out doPut()
		const mockDoPut = jest.fn(() => {
			// mock the image already existing;
			// this is a piece of what DynamoDB would return in this case
			throw {
				code: "ConditionalCheckFailedException"
			};
		});
		ctx.doPut = mockDoPut;

		// mock out doUpdate()
		const mockDoUpdate = jest.fn(q => {
			// do some expects *inside* the mocked function
			expect(q).toBeDefined();
			expect(q.TableName).toBe(ctx.tableName);
			expect(q.Key.parentPath).toBe("/2001/12-31/");
			expect(q.Key.itemName).toBe("image.jpg");
			expect(q.UpdateExpression).toBe(
				"SET itemType = if_not_exists(itemType, :itemType), createdOn = if_not_exists(createdOn, :createdOn), updatedOn = :updatedOn, fileUpdatedOn = :fileUpdatedOn, mimeSubType = :mimeSubType, dimensions = :dimensions, capturedOn = :capturedOn REMOVE tags"
			);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":updatedOn"]);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":fileUpdatedOn"]);
			expect(Object.keys(q.ExpressionAttributeValues).length).toBe(7);
			return {};
		});
		ctx.doUpdate = mockDoUpdate;

		// do the update
		const response = await storeImage(event, ctx);

		// did the mocks get called?
		expect(ctx.doTransaction).toBeCalledTimes(1);
		expect(ctx.doUpdate).toBeCalledTimes(1);

		expect(response).toBe("SUCCESS");
	});
});

const minimumMetadata = {
	dimensions: {
		width: 4032,
		height: 3024
	},
	fileSize: "2.136MB",
	format: "JPEG"
};

const blankTitleMetadata = {
	dimensions: {
		width: 4032,
		height: 3024
	},
	fileSize: "2.136MB",
	format: "JPEG",
	title: "",
	description: ""
};

const metadata = {
	creationTime: "2019-02-15T17:04:23.000Z",
	title: "Title 1",
	description: "Description 2",
	tags: ["trip", "zoo", "cousins"],
	geo: {
		latitude: {
			D: 33,
			M: 53,
			S: 52.41,
			Direction: "N"
		},
		longitude: {
			D: 118,
			M: 25,
			S: 7.25,
			Direction: "W"
		}
	},
	exifMake: "LGE",
	exifModel: "Nexus 5X",
	dimensions: {
		width: 4032,
		height: 3024
	},
	fileSize: "2.136MB",
	format: "JPEG"
};

const metadataWithoutTagsOrCreationTime = {
	geo: {
		latitude: {
			D: 33,
			M: 53,
			S: 52.41,
			Direction: "N"
		},
		longitude: {
			D: 118,
			M: 25,
			S: 7.25,
			Direction: "W"
		}
	},
	exifMake: "LGE",
	exifModel: "Nexus 5X",
	dimensions: {
		width: 4032,
		height: 3024
	},
	fileSize: "2.136MB",
	format: "JPEG"
};
