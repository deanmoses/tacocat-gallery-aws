const updateAlbum = require("./update_album.js");
const BadRequestException = require("./BadRequestException.js");
const JestUtils = require("../../../tests/utils/JestUtils.js");

const albumPath = "/2001/12-31/";

// Execution context: stuff passed in to updateAlbum(ctx, ...)
// Created in beforeEach()
let ctx;

//
// TEST SETUP AND TEARDOWN
//

beforeEach(() => {
	// Mock out an execution context to be passed into updateAlbum(ctx, ...)
	ctx = {};

	// Fake DynamoDB table name goes into execution context
	ctx.tableName = "NotARealTableName";

	// A mock itemExists function goes into execution context
	const mockItemExists = jest.fn();
	mockItemExists.mockReturnValue(true); // Will return true, as in image exists
	ctx.itemExists = mockItemExists;

	// A mock doUpdate function goes into execution context
	const mockDoUpdate = jest.fn();
	mockDoUpdate.mockReturnValue({}); // Will return empty object {}
	ctx.doUpdate = mockDoUpdate;
});

//
// TESTS
//

describe("Update Album", () => {
	test("title", async () => {
		expect.assertions(13);
		const newTitle = "New Title 1";

		// mock out doUpdate()
		const mockDoUpdate = jest.fn(q => {
			// do some expects *inside* the mocked function
			expect(q).toBeDefined();
			expect(q.TableName).toBe(ctx.tableName);
			expect(q.Key.parentPath).toBe("/2001/");
			expect(q.Key.itemName).toBe("12-31");
			expect(q.UpdateExpression).toBe(
				"SET title = :title, updatedOn = :updatedOn"
			);
			expect(Object.keys(q.ExpressionAttributeValues).length).toBe(2);
			expect(q.ExpressionAttributeValues[":title"]).toBe(newTitle);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":updatedOn"]);
			expect(q.ConditionExpression).toBe("attribute_exists (itemName)");
			return {};
		});
		ctx.doUpdate = mockDoUpdate;

		// do the update
		let result = await updateAlbum(ctx, albumPath, {
			title: newTitle
		});

		// did the mock update get called?
		expect(ctx.doUpdate).toBeCalledTimes(1);

		expect(result).toBeDefined();
		expect(Object.keys(result).length).toBe(0);
	});

	test("blank title (unset title)", async () => {
		expect.assertions(12);
		const newTitle = "";
		// mock out doUpdate()
		const mockDoUpdate = jest.fn(q => {
			// do some expects *inside* the mocked function
			expect(q).toBeDefined();
			expect(q.TableName).toBe(ctx.tableName);
			expect(q.Key.parentPath).toBe("/2001/");
			expect(q.Key.itemName).toBe("12-31");
			expect(q.UpdateExpression).toBe(
				"SET updatedOn = :updatedOn REMOVE title"
			);
			expect(Object.keys(q.ExpressionAttributeValues).length).toBe(1);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":updatedOn"]);
			expect(q.ConditionExpression).toBe("attribute_exists (itemName)");
			return {};
		});
		ctx.doUpdate = mockDoUpdate;
		let result = await updateAlbum(ctx, albumPath, {
			title: newTitle
		});
		expect(ctx.doUpdate).toBeCalledTimes(1);
		expect(result).toBeDefined();
		expect(Object.keys(result).length).toBe(0);
	});

	test("description", async () => {
		expect.assertions(13);
		const newDescription = "New Description 1";
		// mock out doUpdate()
		const mockDoUpdate = jest.fn(q => {
			// do some expects *inside* the mocked function
			expect(q).toBeDefined();
			expect(q.TableName).toBe(ctx.tableName);
			expect(q.Key.parentPath).toBe("/2001/");
			expect(q.Key.itemName).toBe("12-31");
			expect(q.UpdateExpression).toBe(
				"SET description = :description, updatedOn = :updatedOn"
			);
			expect(Object.keys(q.ExpressionAttributeValues).length).toBe(2);
			expect(q.ExpressionAttributeValues[":description"]).toBe(newDescription);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":updatedOn"]);
			expect(q.ConditionExpression).toBe("attribute_exists (itemName)");
			return {};
		});
		ctx.doUpdate = mockDoUpdate;
		let result = await updateAlbum(ctx, albumPath, {
			description: newDescription
		});
		expect(ctx.doUpdate).toBeCalledTimes(1);
		expect(result).toBeDefined();
		expect(Object.keys(result).length).toBe(0);
	});

	test("blank description (unset description)", async () => {
		expect.assertions(12);
		const newDescription = "";
		// mock out doUpdate()
		const mockDoUpdate = jest.fn(q => {
			// do some expects *inside* the mocked function
			expect(q).toBeDefined();
			expect(q.TableName).toBe(ctx.tableName);
			expect(q.Key.parentPath).toBe("/2001/");
			expect(q.Key.itemName).toBe("12-31");
			expect(q.UpdateExpression).toBe(
				"SET updatedOn = :updatedOn REMOVE description"
			);
			expect(Object.keys(q.ExpressionAttributeValues).length).toBe(1);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":updatedOn"]);
			expect(q.ConditionExpression).toBe("attribute_exists (itemName)");
			return {};
		});
		ctx.doUpdate = mockDoUpdate;
		let result = await updateAlbum(ctx, albumPath, {
			description: newDescription
		});
		expect(ctx.doUpdate).toBeCalledTimes(1);
		expect(result).toBeDefined();
		expect(Object.keys(result).length).toBe(0);
	});

	test("title and description", async () => {
		expect.assertions(14);
		const newTitle = "New Title 2";
		const newDescription = "New Description 2";
		// mock out doUpdate()
		const mockDoUpdate = jest.fn(q => {
			// do some expects *inside* the mocked function
			expect(q).toBeDefined();
			expect(q.TableName).toBe(ctx.tableName);
			expect(q.Key.parentPath).toBe("/2001/");
			expect(q.Key.itemName).toBe("12-31");
			expect(q.UpdateExpression).toBe(
				"SET title = :title, description = :description, updatedOn = :updatedOn"
			);
			expect(Object.keys(q.ExpressionAttributeValues).length).toBe(3);
			expect(q.ExpressionAttributeValues[":title"]).toBe(newTitle);
			expect(q.ExpressionAttributeValues[":description"]).toBe(newDescription);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":updatedOn"]);
			expect(q.ConditionExpression).toBe("attribute_exists (itemName)");
			return {};
		});
		ctx.doUpdate = mockDoUpdate;
		let result = await updateAlbum(ctx, albumPath, {
			title: newTitle,
			description: newDescription
		});
		expect(ctx.doUpdate).toBeCalledTimes(1);
		expect(result).toBeDefined();
		expect(Object.keys(result).length).toBe(0);
	});

	test("valid thumbnail", async () => {
		expect.assertions(14);
		const newThumbnail = "/2001/12-31/image.jpg";
		// mock out doUpdate()
		const mockDoUpdate = jest.fn(q => {
			// do some expects *inside* the mocked function
			expect(q).toBeDefined();
			expect(q.TableName).toBe(ctx.tableName);
			expect(q.Key.parentPath).toBe("/2001/");
			expect(q.Key.itemName).toBe("12-31");
			expect(q.UpdateExpression).toBe(
				"SET thumbnail = :thumbnail, updatedOn = :updatedOn"
			);
			expect(Object.keys(q.ExpressionAttributeValues).length).toBe(2);
			expect(q.ExpressionAttributeValues[":thumbnail"]).toBe(newThumbnail);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":updatedOn"]);
			expect(q.ConditionExpression).toBe("attribute_exists (itemName)");
			return {};
		});
		ctx.doUpdate = mockDoUpdate;
		let result = await updateAlbum(ctx, albumPath, {
			thumbnail: newThumbnail
		});
		expect(ctx.doUpdate).toBeCalledTimes(1);
		expect(result).toBeDefined();
		expect(Object.keys(result).length).toBe(0);
		// Ensure that updateImage() calls itemExists() to check on the existence of the thumbnail image
		expect(ctx.itemExists).toBeCalledTimes(1);
	});

	test("blank thumbnail (unset thumb)", async () => {
		expect.assertions(13);
		const newThumbnail = "";
		// mock out doUpdate()
		const mockDoUpdate = jest.fn(q => {
			// do some expects *inside* the mocked function
			expect(q).toBeDefined();
			expect(q.TableName).toBe(ctx.tableName);
			expect(q.Key.parentPath).toBe("/2001/");
			expect(q.Key.itemName).toBe("12-31");
			expect(q.UpdateExpression).toBe(
				"SET updatedOn = :updatedOn REMOVE thumbnail"
			);
			expect(Object.keys(q.ExpressionAttributeValues).length).toBe(1);
			JestUtils.expectValidDate(q.ExpressionAttributeValues[":updatedOn"]);
			expect(q.ConditionExpression).toBe("attribute_exists (itemName)");
			return {};
		});
		ctx.doUpdate = mockDoUpdate;
		let result = await updateAlbum(ctx, albumPath, {
			thumbnail: newThumbnail
		});
		expect(ctx.doUpdate).toBeCalledTimes(1);
		expect(result).toBeDefined();
		expect(Object.keys(result).length).toBe(0);

		// When thumbnail is being set to blank, updateImage() should not call
		// itemExists() to check if the blank thumbnail exists
		expect(ctx.itemExists).toBeCalledTimes(0);
	});

	test("nonexistent thumbnail", async () => {
		expect.assertions(1);
		const newThumbnail = "/2001/12-31/image.jpg";
		ctx.itemExists = async () => {
			return false;
		};
		try {
			let result = await updateAlbum(ctx, albumPath, {
				thumbnail: newThumbnail
			});
			throw ("Was not expecting success.  Got: ", result);
		} catch (e) {
			expect(e).toBeInstanceOf(BadRequestException); // Expect this error
		}
	});

	test.each([
		"asdf",
		"/2001/12-31/",
		"/2001/12-31/image",
		"2001/12-31/image.jpg",
		"//2001/12-31/image.jpg",
		"image.jpg"
	])("Malformed thumbnail image path: '%s'", async newThumbnail => {
		expect.assertions(2);
		try {
			let result = await updateAlbum(ctx, albumPath, {
				thumbnail: newThumbnail
			});
			throw ("Was not expecting success.  Got: ", result);
		} catch (e) {
			expect(e).toBeInstanceOf(BadRequestException); // Expect this error
			expect(e.message).toMatch(/Malformed/);
		}
	});

	test("root album", async () => {
		expect.assertions(2);
		try {
			let q = await updateAlbum(ctx, "/", {
				title: "New Title"
			});
			throw ("Was not expecting success.  Got: ", q);
		} catch (e) {
			expect(e).toBeInstanceOf(BadRequestException); // Expect this error
			expect(e.message).toMatch(/root/);
		}
	});

	test("empty data", async () => {
		expect.assertions(2);
		const attributesToUpdate = {};
		try {
			let result = await updateAlbum(ctx, albumPath, attributesToUpdate);
			throw ("Was not expecting success.  Got: ", result);
		} catch (e) {
			expect(e).toBeInstanceOf(BadRequestException); // Expect this error
			expect(e.message).toMatch(/No attributes/);
		}
	});

	test("null data", async () => {
		expect.assertions(2);
		const attributesToUpdate = null;
		try {
			let result = await updateAlbum(ctx, albumPath, attributesToUpdate);
			throw ("Was not expecting success.  Got: ", result);
		} catch (e) {
			expect(e).toBeInstanceOf(BadRequestException); // Expect this error
			expect(e.message).toMatch(/No attributes/);
		}
	});

	test("only bad data", async () => {
		expect.assertions(2);
		try {
			let result = await updateAlbum(ctx, albumPath, {
				noSuchAttribute: "some value"
			});
			throw ("Was not expecting success.  Got: ", result);
		} catch (e) {
			expect(e).toBeInstanceOf(BadRequestException); // Expect this error
			expect(e.message).toContain("noSuchAttribute");
		}
	});

	test("both real and bad data", async () => {
		expect.assertions(2);
		try {
			let result = await updateAlbum(ctx, albumPath, {
				title: "New Title 3",
				noSuchAttribute: "some value"
			});
			throw ("Was not expecting success.  Got: ", result);
		} catch (e) {
			expect(e).toBeInstanceOf(BadRequestException); // Expect this error
			expect(e.message).toContain("noSuchAttribute");
		}
	});

	test("Missing albumPath", async () => {
		expect.assertions(2);
		try {
			let result = await updateAlbum(ctx, null /*no album*/, {
				title: "New Title 3"
			});
			throw ("Was not expecting success.  Got: ", result);
		} catch (e) {
			expect(e).toBeInstanceOf(BadRequestException); // Expect this error
			expect(e.message).toContain("album");
		}
	});
});
