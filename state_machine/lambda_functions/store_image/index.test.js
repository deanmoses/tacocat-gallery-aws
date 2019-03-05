const doLambda = require("./index.js").doLambda;
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
		extractedMetadata: {}
	};

	// Mock out an execution context to be passed into method being tested
	ctx = {
		tableName: "NotARealTableName"
	};

	// A mock doPut function goes into execution context
	const mockDoPut = jest.fn();
	mockDoPut.mockReturnValue({}); // Will return empty object {}
	ctx.doPut = mockDoPut;

	// A mock doUpdate function goes into execution context
	const mockDoUpdate = jest.fn();
	mockDoUpdate.mockReturnValue({}); // Will return empty object {}
	ctx.doUpdate = mockDoUpdate;
});

describe("Store Image", () => {
	/**
	 *
	 */
	test("Empty Image Metadata", async () => {
		expect.assertions(27);

		// mock out doPut()
		const mockDoPut = jest.fn(q => {
			// do some expects *inside* the mocked function
			expect(q).toBeDefined();
			expect(q.TableName).toBe(ctx.tableName);
			expect(q.Item.parentPath).toBe("/2001/12-31/");
			expect(q.Item.itemName).toBe("image.jpg");
			expect(q.Item.itemType).toBe("media");
			JestUtils.expectValidDate(q.Item.createdOn);
			JestUtils.expectValidDate(q.Item.updatedOn);
			JestUtils.expectValidDate(q.Item.fileUpdatedOn);
			expect(Object.keys(q.Item).length).toBe(6);
			expect(q.ConditionExpression).toBe("attribute_not_exists (itemName)");
			return {};
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
				"SET updatedOn = :updatedOn, fileUpdatedOn = :fileUpdatedOn"
			);
			expect(Object.keys(q.ExpressionAttributeValues).length).toBe(2);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":updatedOn"]);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":fileUpdatedOn"]);
			expect(q.ConditionExpression).toBe("attribute_exists (itemName)");
			return {};
		});
		ctx.doUpdate = mockDoUpdate;

		// do the update
		const response = await doLambda(event, ctx);

		// did the mocks get called?
		expect(ctx.doPut).toBeCalledTimes(1);
		expect(ctx.doUpdate).toBeCalledTimes(1);

		expect(response).toBe("SUCCESS");
	});

	/**
	 *
	 */
	test("Metadata With Title and Description", async () => {
		expect.assertions(34);

		event.extractedMetadata = metadata;

		// mock out doPut()
		const mockDoPut = jest.fn(q => {
			// do some expects *inside* the mocked function
			expect(q).toBeDefined();
			expect(q.TableName).toBe(ctx.tableName);
			expect(q.Item.parentPath).toBe("/2001/12-31/");
			expect(q.Item.itemName).toBe("image.jpg");
			expect(q.Item.itemType).toBe("media");
			JestUtils.expectValidDate(q.Item.createdOn);
			JestUtils.expectValidDate(q.Item.updatedOn);
			JestUtils.expectValidDate(q.Item.fileUpdatedOn);
			expect(q.Item.title).toBe(metadata.title);
			expect(q.Item.description).toBe(metadata.description);
			expect(Object.keys(q.Item).length).toBe(8);
			expect(q.ConditionExpression).toBe("attribute_not_exists (itemName)");
			return {};
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
				"SET updatedOn = :updatedOn, fileUpdatedOn = :fileUpdatedOn, mimeSubType = :mimeSubType, dimensions = :dimensions, capturedOn = :capturedOn, tags = :tags"
			);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":updatedOn"]);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":fileUpdatedOn"]);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":capturedOn"]);
			expect(q.ExpressionAttributeValues[":mimeSubType"]).toBe("jpeg");
			expect(q.ExpressionAttributeValues[":dimensions"]).toBe(
				metadata.dimensions
			);
			expect(q.ExpressionAttributeValues[":tags"]).toBe(metadata.tags);
			expect(Object.keys(q.ExpressionAttributeValues).length).toBe(6);
			expect(q.ConditionExpression).toBe("attribute_exists (itemName)");
			return {};
		});
		ctx.doUpdate = mockDoUpdate;

		// do the update
		const response = await doLambda(event, ctx);

		// did the mocks get called?
		expect(ctx.doPut).toBeCalledTimes(1);
		expect(ctx.doUpdate).toBeCalledTimes(1);

		expect(response).toBe("SUCCESS");
	});

	/**
	 *
	 */
	test("Metadata Without Tags or CreationTime", async () => {
		expect.assertions(33);

		event.extractedMetadata = metadataWithoutTagsOrCreationTime;

		// mock out doPut()
		const mockDoPut = jest.fn(q => {
			// do some expects *inside* the mocked function
			expect(q).toBeDefined();
			expect(q.TableName).toBe(ctx.tableName);
			expect(q.Item.parentPath).toBe("/2001/12-31/");
			expect(q.Item.itemName).toBe("image.jpg");
			expect(q.Item.itemType).toBe("media");
			JestUtils.expectValidDate(q.Item.createdOn);
			JestUtils.expectValidDate(q.Item.updatedOn);
			JestUtils.expectValidDate(q.Item.fileUpdatedOn);
			expect(q.Item.title).toBeUndefined();
			expect(q.Item.description).toBeUndefined();
			expect(Object.keys(q.Item).length).toBe(6);
			expect(q.ConditionExpression).toBe("attribute_not_exists (itemName)");
			return {};
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
				"SET updatedOn = :updatedOn, fileUpdatedOn = :fileUpdatedOn, mimeSubType = :mimeSubType, dimensions = :dimensions"
			);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":updatedOn"]);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":fileUpdatedOn"]);
			expect(q.ExpressionAttributeValues[":capturedOn"]).toBeUndefined();
			expect(q.ExpressionAttributeValues[":tags"]).toBeUndefined();
			expect(q.ExpressionAttributeValues[":mimeSubType"]).toBe("jpeg");
			expect(q.ExpressionAttributeValues[":dimensions"]).toBe(
				metadataWithoutTagsOrCreationTime.dimensions
			);
			expect(Object.keys(q.ExpressionAttributeValues).length).toBe(4);
			expect(q.ConditionExpression).toBe("attribute_exists (itemName)");
			return {};
		});
		ctx.doUpdate = mockDoUpdate;

		// do the update
		const response = await doLambda(event, ctx);

		// did the mocks get called?
		expect(ctx.doPut).toBeCalledTimes(1);
		expect(ctx.doUpdate).toBeCalledTimes(1);

		expect(response).toBe("SUCCESS");
	});

	/**
	 *
	 */
	test("Metadata With Just CreationTime", async () => {
		expect.assertions(16);

		event.extractedMetadata = {
			creationTime: "2018-12-31T13:03:15.000Z"
		};

		// mock out doUpdate()
		const mockDoUpdate = jest.fn(q => {
			// do some expects *inside* the mocked function
			expect(q).toBeDefined();
			expect(q.TableName).toBe(ctx.tableName);
			expect(q.Key.parentPath).toBe("/2001/12-31/");
			expect(q.Key.itemName).toBe("image.jpg");
			expect(q.UpdateExpression).toBe(
				"SET updatedOn = :updatedOn, fileUpdatedOn = :fileUpdatedOn, capturedOn = :capturedOn"
			);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":updatedOn"]);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":fileUpdatedOn"]);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":capturedOn"]);
			expect(Object.keys(q.ExpressionAttributeValues).length).toBe(3);
			expect(q.ConditionExpression).toBe("attribute_exists (itemName)");
			return {};
		});
		ctx.doUpdate = mockDoUpdate;

		// do the update
		const response = await doLambda(event, ctx);

		// did the mocks get called?
		expect(ctx.doPut).toBeCalledTimes(1);
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
				"SET updatedOn = :updatedOn, fileUpdatedOn = :fileUpdatedOn"
			);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":updatedOn"]);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":fileUpdatedOn"]);
			expect(Object.keys(q.ExpressionAttributeValues).length).toBe(2);
			expect(q.ConditionExpression).toBe("attribute_exists (itemName)");
			return {};
		});
		ctx.doUpdate = mockDoUpdate;

		// do the update
		const response = await doLambda(event, ctx);

		// did the mocks get called?
		expect(ctx.doPut).toBeCalledTimes(1);
		expect(ctx.doUpdate).toBeCalledTimes(1);

		expect(response).toBe("SUCCESS");
	});

	/**
	 *
	 */
	test("Another failure in putItem", async () => {
		expect.assertions(3);

		// mock out doPut()
		const mockDoPut = jest.fn(() => {
			// This is part of the exception DynamoDB would return if the image existed
			throw "xxyz";
		});
		ctx.doPut = mockDoPut;

		// do the update, expecting it to fail with the error message thrown above
		await expect(doLambda(event, ctx)).rejects.toMatch("xxyz");

		// did the mocks get called?
		expect(ctx.doPut).toBeCalledTimes(1);
		expect(ctx.doUpdate).toBeCalledTimes(0);
	});
});

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
