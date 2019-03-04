const pth = require("./getParentFromPath.js");

test("empty", () => {
	expect(() => {
		pth();
	}).toThrow();
	expect(() => {
		pth("");
	}).toThrow();
	expect(() => {
		pth("   ");
	}).toThrow();
});

test("/", () => {
	expect(pth("/")).toBe("");
	expect(pth("/   ")).toBe("");
});

test("/2001", () => {
	expect(pth("/2001")).toBe("/");
	expect(pth("/2001   ")).toBe("/");
	expect(pth("/2001/")).toBe("/");
	expect(pth("/2001/   ")).toBe("/");
	expect(pth("2001/")).toBe("/");
	expect(pth("2001/    ")).toBe("/");
});

test("/2001/12-31", () => {
	expect(pth("/2001/12-31")).toBe("/2001/");
	expect(pth("/2001/12-31/")).toBe("/2001/");
	expect(pth("2001/12-31")).toBe("/2001/");
	expect(pth("2001/12-31/")).toBe("/2001/");
});

test("/2001/12-31/image.jpg", () => {
	expect(pth("/2001/12-31/image.jpg")).toBe("/2001/12-31/");
	expect(pth("2001/12-31/image.jpg")).toBe("/2001/12-31/");
	expect(pth("2001/12-31/i.jpg")).toBe("/2001/12-31/");
	expect(pth("2001/12-31/i.j")).toBe("/2001/12-31/");
	expect(pth("2001/12-31/i.")).toBe("/2001/12-31/");
	expect(pth("2001/12-31/i")).toBe("/2001/12-31/");
});

test("/some/random/long/path/should/work", () => {
	expect(pth("/some/random/long/path/should/work")).toBe(
		"/some/random/long/path/should/"
	);
	expect(pth("/some/random/long/path/should/work/")).toBe(
		"/some/random/long/path/should/"
	);
});

test("/some/random/long/path/should/work/image.jpg", () => {
	expect(pth("/some/random/long/path/should/work/image.jpg")).toBe(
		"/some/random/long/path/should/work/"
	);
});
