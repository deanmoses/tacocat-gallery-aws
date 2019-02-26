const JestUtils = require("../../../tests/utils/JestUtils.js");
const genQuery = require("./update_album_query_generator.js");
const BadRequestException = require("./BadRequestException.js");

const tableName = "NotARealTableName";
const albumPath = "/2001/12-31";

test("Update title", async () => {
	expect.assertions(9);
	const title = "New Title 1";
	let q = genQuery(tableName, albumPath, {
		title: title
	});
	expect(q).toBeDefined();
	expect(q.TableName).toBe(tableName);
	expect(q.Key.parentPath).toBe("/2001/");
	expect(q.Key.itemName).toBe("12-31");
	expect(q.UpdateExpression).toBe(
		"SET title = :title, updateDateTime = :updateDateTime"
	);
	expect(q.ExpressionAttributeValues[":title"]).toBe(title);
	JestUtils.expectValidDate(q.ExpressionAttributeValues[":updateDateTime"]);
	expect(q.ConditionExpression).toBe("attribute_exists (itemName)");
});

test("Update blank title", async () => {
	expect.assertions(9);
	const title = "";
	let q = genQuery(tableName, albumPath, {
		title: title
	});
	expect(q).toBeDefined();
	expect(q.TableName).toBe(tableName);
	expect(q.Key.parentPath).toBe("/2001/");
	expect(q.Key.itemName).toBe("12-31");
	expect(q.UpdateExpression).toBe(
		"SET title = :title, updateDateTime = :updateDateTime"
	);
	expect(q.ExpressionAttributeValues[":title"]).toBe(title);
	JestUtils.expectValidDate(q.ExpressionAttributeValues[":updateDateTime"]);
	expect(q.ConditionExpression).toBe("attribute_exists (itemName)");
});

test("Update description", async () => {
	expect.assertions(9);
	const description = "New Description 1";
	let q = genQuery(tableName, albumPath, {
		description: description
	});
	expect(q).toBeDefined();
	expect(q.TableName).toBe(tableName);
	expect(q.Key.parentPath).toBe("/2001/");
	expect(q.Key.itemName).toBe("12-31");
	expect(q.UpdateExpression).toBe(
		"SET description = :description, updateDateTime = :updateDateTime"
	);
	expect(q.ExpressionAttributeValues[":description"]).toBe(description);
	JestUtils.expectValidDate(q.ExpressionAttributeValues[":updateDateTime"]);
	expect(q.ConditionExpression).toBe("attribute_exists (itemName)");
});

test("Update title and description", async () => {
	expect.assertions(10);
	const title = "New Title 1";
	const description = "New Description 1";
	let q = genQuery(tableName, albumPath, {
		title: title,
		description: description
	});
	expect(q).toBeDefined();
	expect(q.TableName).toBe(tableName);
	expect(q.Key.parentPath).toBe("/2001/");
	expect(q.Key.itemName).toBe("12-31");
	expect(q.UpdateExpression).toBe(
		"SET title = :title, description = :description, updateDateTime = :updateDateTime"
	);
	expect(q.ExpressionAttributeValues[":title"]).toBe(title);
	expect(q.ExpressionAttributeValues[":description"]).toBe(description);
	JestUtils.expectValidDate(q.ExpressionAttributeValues[":updateDateTime"]);
	expect(q.ConditionExpression).toBe("attribute_exists (itemName)");
});

test("Update thumbnail", async () => {
	expect.assertions(9);
	const thumbnail = "/2001/12-31/image.jpg";
	let q = genQuery(tableName, albumPath, {
		thumbnail: thumbnail
	});
	expect(q).toBeDefined();
	expect(q.TableName).toBe(tableName);
	expect(q.Key.parentPath).toBe("/2001/");
	expect(q.Key.itemName).toBe("12-31");
	expect(q.UpdateExpression).toBe(
		"SET thumbnail = :thumbnail, updateDateTime = :updateDateTime"
	);
	expect(q.ExpressionAttributeValues[":thumbnail"]).toBe(thumbnail);
	JestUtils.expectValidDate(q.ExpressionAttributeValues[":updateDateTime"]);
	expect(q.ConditionExpression).toBe("attribute_exists (itemName)");
});

test.each([
	"asdf",
	"/2001/12-31/",
	"/2001/12-31/image",
	"2001/12-31/image.jpg",
	"image.jpg"
])("Bad thumb: %s", imagePath => {
	expect(() => {
		genQuery(tableName, albumPath, {
			thumbnail: imagePath
		});
	}).toThrow(BadRequestException);
});

test("Update root album", async () => {
	expect.assertions(2);
	try {
		let q = genQuery(tableName, "/", {});
		throw ("Was not expecting success.  Got: ", q);
	} catch (e) {
		expect(e).toBeInstanceOf(BadRequestException); // Expect this error
		expect(e.message).toMatch(/root/);
	}
});

test("Update with empty data", async () => {
	expect.assertions(1);
	try {
		let q = genQuery(tableName, albumPath, {});
		throw ("Was not expecting success.  Got: ", q);
	} catch (e) {
		expect(e).toBeInstanceOf(BadRequestException); // Expect this error
	}
});

test("Update with null data", async () => {
	expect.assertions(1);
	try {
		let q = genQuery(tableName, albumPath, null);
		throw ("Was not expecting success.  Got: ", q);
	} catch (e) {
		expect(e).toBeInstanceOf(BadRequestException); // Expect this error
	}
});

test("Update with only bad data", async () => {
	expect.assertions(2);
	try {
		let q = await genQuery(tableName, albumPath, {
			noSuchAttribute: "some value"
		});
		throw ("Was not expecting success.  Got: ", q);
	} catch (e) {
		expect(e).toBeInstanceOf(BadRequestException); // Expect this error
		expect(e.message).toContain("noSuchAttribute");
	}
});

test("Update with both real and bad data", async () => {
	expect.assertions(2);
	try {
		let result = await genQuery(tableName, albumPath, {
			title: "New Title 3",
			noSuchAttribute: "some value"
		});
		throw ("Was not expecting success.  Got: ", result);
	} catch (e) {
		expect(e).toBeInstanceOf(BadRequestException); // Expect this error
		expect(e.message).toContain("noSuchAttribute");
	}
});

test("Missing album ID", async () => {
	expect.assertions(2);
	try {
		let result = await genQuery(tableName, null /*no album*/, {
			title: "New Title 3"
		});
		throw ("Was not expecting success.  Got: ", result);
	} catch (e) {
		expect(e).toBeInstanceOf(BadRequestException); // Expect this error
		expect(e.message).toContain("album");
	}
});
