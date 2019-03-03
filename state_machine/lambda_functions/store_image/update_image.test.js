const updateImage = require("./update_image.js");
const JestUtils = require("../../../tests/utils/JestUtils.js");

const imagePath = "/2001/12-31/image.jpg";

// Execution context: stuff passed in to updateImage(ctx, ...)
// Created in beforeEach()
let ctx;

//
// TEST SETUP AND TEARDOWN
//

beforeEach(() => {
	// Mock out an execution context to be passed into updateImage(ctx, ...)
	ctx = {};

	// Fake DynamoDB table name goes into execution context
	ctx.tableName = "NotARealTableName";

	// A mock doUpdate function goes into execution context
	const mockDoUpdate = jest.fn();
	mockDoUpdate.mockReturnValue({}); // Will return empty object {}
	ctx.doUpdate = mockDoUpdate;
});

describe("Update Image", () => {
	test("Update New Image", async () => {
		expect.assertions(13);

		// mock out doUpdate()
		const mockDoUpdate = jest.fn(q => {
			// do some expects *inside* the mocked function
			expect(q).toBeDefined();
			expect(q.TableName).toBe(ctx.tableName);
			expect(q.Key.parentPath).toBe("/2001/12-31/");
			expect(q.Key.itemName).toBe("image.jpg");
			expect(q.UpdateExpression).toBe(
				"SET updatedOn = :updatedOn, fileUpdatedOn = :fileUpdatedOn, mimeSubType = :mimeSubType, dimensions = :dimensions, capturedOn = :capturedOn, title = :title, description = :description, tags = :tags"
			);
			expect(Object.keys(q.ExpressionAttributeValues).length).toBe(8);
			expect(q.ExpressionAttributeValues[":mimeSubType"]).toBe("jpeg");
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":updatedOn"]);
			expect(q.ConditionExpression).toBe("attribute_exists (itemName)");
			return {};
		});
		ctx.doUpdate = mockDoUpdate;

		// do the update
		const updateResult = await updateImage(
			ctx,
			imagePath,
			true /*imageIsNew*/,
			metadata
		);

		// did the mock update get called?
		expect(ctx.doUpdate).toBeCalledTimes(1);

		expect(updateResult).toBeDefined();
		expect(Object.keys(updateResult).length).toBe(0);
	});

	test("Update Existing Image", async () => {
		expect.assertions(13);

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
			expect(Object.keys(q.ExpressionAttributeValues).length).toBe(6);
			expect(q.ExpressionAttributeValues[":mimeSubType"]).toBe("jpeg");
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":updatedOn"]);
			expect(q.ConditionExpression).toBe("attribute_exists (itemName)");
			return {};
		});
		ctx.doUpdate = mockDoUpdate;

		// do the update
		const updateResult = await updateImage(
			ctx,
			imagePath,
			false /*imageIsNew*/,
			metadata
		);

		// did the mock update get called?
		expect(ctx.doUpdate).toBeCalledTimes(1);

		expect(updateResult).toBeDefined();
		expect(Object.keys(updateResult).length).toBe(0);
	});

	test("Update New Image Without Title or Description", async () => {
		expect.assertions(13);

		// mock out doUpdate()
		const mockDoUpdate = jest.fn(q => {
			// do some expects *inside* the mocked function
			expect(q).toBeDefined();
			expect(q.TableName).toBe(ctx.tableName);
			expect(q.Key.parentPath).toBe("/2001/12-31/");
			expect(q.Key.itemName).toBe("image.jpg");
			expect(q.UpdateExpression).toBe(
				"SET updatedOn = :updatedOn, fileUpdatedOn = :fileUpdatedOn, mimeSubType = :mimeSubType, dimensions = :dimensions, capturedOn = :capturedOn"
			);
			expect(Object.keys(q.ExpressionAttributeValues).length).toBe(5);
			expect(q.ExpressionAttributeValues[":mimeSubType"]).toBe("jpeg");
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":updatedOn"]);
			expect(q.ConditionExpression).toBe("attribute_exists (itemName)");
			return {};
		});
		ctx.doUpdate = mockDoUpdate;

		// do the update
		const updateResult = await updateImage(
			ctx,
			imagePath,
			true /*imageIsNew*/,
			metadataWithoutTitleOrDescription
		);

		// did the mock update get called?
		expect(ctx.doUpdate).toBeCalledTimes(1);

		expect(updateResult).toBeDefined();
		expect(Object.keys(updateResult).length).toBe(0);
	});
});

const metadata = {
	creationTime: "2016:07:06 09:48:21",
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

const metadataWithoutTitleOrDescription = {
	creationTime: "2016:07:06 09:48:21",
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
