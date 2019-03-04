const doIt = require("./index.js").doIt;

// Execution context: stuff passed into method being tested
// Created in beforeEach()
let ctx;

//
// TEST SETUP AND TEARDOWN
//

beforeEach(() => {
	// Mock out an execution context to be passed into method being tested
	ctx = {
		s3BucketName: "s3BucketNotReal",
		originalImagePrefix: "albums",
		derivedImageBucketName: "derivedImageBucket",
		thumbnailImagePrefix: "thumb",
		edgeSize: "200",
		jpegQuality: "90",
		event: {
			path: "/thumb/2001/12-31/image.jpg"
		}
	};
});

describe("Recut Thumbnail", () => {
	test("blank body", async () => {
		ctx.event.body = "";
		const response = await doIt(ctx);
		expect(response.statusCode).toBe(400);
		expect(response.body).toMatch(/body/);
	});

	test("empty body", async () => {
		ctx.event.body = JSON.stringify({});
		const response = await doIt(ctx);
		expect(response.statusCode).toBe(400);
		expect(response.body).toMatch(/x:/);
	});
	test("missing x", async () => {
		ctx.event.body = JSON.stringify({ y: 0, length: 200 });
		const response = await doIt(ctx);
		expect(response.statusCode).toBe(400);
		expect(response.body).toMatch(/x:/);
	});
	test("missing y", async () => {
		ctx.event.body = JSON.stringify({ x: 0, length: 200 });
		const response = await doIt(ctx);
		expect(response.statusCode).toBe(400);
		expect(response.body).toMatch(/y:/);
	});
	test("missing length", async () => {
		ctx.event.body = JSON.stringify({ x: 0, y: 0 });
		const response = await doIt(ctx);
		expect(response.statusCode).toBe(400);
		expect(response.body).toMatch(/length:/);
	});
	test("blank x", async () => {
		ctx.event.body = JSON.stringify({ x: "", y: 0, length: 200 });
		const response = await doIt(ctx);
		expect(response.statusCode).toBe(400);
		expect(response.body).toMatch(/x:/);
	});

	test("negative x", async () => {
		ctx.event.body = JSON.stringify({ x: -1, y: 0, length: 200 });
		const response = await doIt(ctx);
		expect(response.statusCode).toBe(400);
		expect(response.body).toMatch(/x:/);
	});

	test("float x", async () => {
		ctx.event.body = JSON.stringify({ x: 1.1, y: 0, length: 200 });
		const response = await doIt(ctx);
		expect(response.statusCode).toBe(400);
		expect(response.body).toMatch(/x:/);
	});

	test("non-number x", async () => {
		ctx.event.body = JSON.stringify({ x: "asdf", y: 0, length: 200 });
		const response = await doIt(ctx);
		expect(response.statusCode).toBe(400);
		expect(response.body).toMatch(/x:/);
	});

	test("float non-number x", async () => {
		ctx.event.body = JSON.stringify({ x: "1.1", y: 0, length: 200 });
		const response = await doIt(ctx);
		expect(response.statusCode).toBe(400);
		expect(response.body).toMatch(/x:/);
	});

	test("string integer x", async () => {
		ctx.event.body = JSON.stringify({ x: "1", y: "wrong", length: 200 });
		const response = await doIt(ctx);
		expect(response.statusCode).toBe(400);
		expect(response.body).toMatch(/y:/);
	});

	test("string zero x", async () => {
		ctx.event.body = JSON.stringify({ x: "0", y: "wrong", length: 200 });
		const response = await doIt(ctx);
		expect(response.statusCode).toBe(400);
		expect(response.body).toMatch(/y:/);
	});

	test("string integer x", async () => {
		ctx.event.body = JSON.stringify({ x: 0, y: "wrong", length: 200 });
		const response = await doIt(ctx);
		expect(response.statusCode).toBe(400);
		expect(response.body).toMatch(/y:/);
	});
});
