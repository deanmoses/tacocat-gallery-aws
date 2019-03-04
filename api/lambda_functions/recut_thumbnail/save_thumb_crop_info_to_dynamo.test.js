const saveThumbnailCropInfoToDynamo = require("./save_thumb_crop_info_to_dynamo.js");
const JestUtils = require("../../../tests/utils/JestUtils.js");

const imagePath = "/2001/12-31/image.jpg";

const crop = {
	x: 30,
	y: 80,
	length: 500
};

// Execution context: stuff passed in to saveThumbnailCropInfoToDynamo(ctx, ...)
// Created in beforeEach()
let ctx;

//
// TEST SETUP AND TEARDOWN
//

beforeEach(() => {
	// Mock out an execution context to be passed into saveThumbnailCropInfoToDynamo(ctx, ...)
	ctx = {};

	// Fake DynamoDB table name goes into execution context
	ctx.tableName = "NotARealTableName";

	// A mock doUpdate function goes into execution context
	const mockDoUpdate = jest.fn();
	mockDoUpdate.mockReturnValue({}); // Will return empty object {}
	ctx.doUpdate = mockDoUpdate;
});

describe("Save Thumbnail Crop Info To Dynamo", () => {
	test("Save Crop", async () => {
		expect.assertions(14);

		// mock out doUpdate()
		const mockDoUpdate = jest.fn(q => {
			// do some expects *inside* the mocked function
			expect(q).toBeDefined();
			expect(q.TableName).toBe(ctx.tableName);
			expect(q.Key.parentPath).toBe("/2001/12-31/");
			expect(q.Key.itemName).toBe("image.jpg");
			expect(q.UpdateExpression).toBe(
				"SET thumbnail = :thumbnail, updatedOn = :updatedOn"
			);
			expect(Object.keys(q.ExpressionAttributeValues).length).toBe(2);
			JestUtils.expectValidDate(
				q.ExpressionAttributeValues[":thumbnail"].fileUpdatedOn
			);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":updatedOn"]);
			expect(q.ConditionExpression).toBe("attribute_exists (itemName)");
			return {};
		});
		ctx.doUpdate = mockDoUpdate;

		// do the update
		const response = await saveThumbnailCropInfoToDynamo(ctx, imagePath, crop);

		// did the mock update get called?
		expect(ctx.doUpdate).toBeCalledTimes(1);

		expect(response).toBeDefined();
		expect(Object.keys(response).length).toBe(0);
	});
});
