const getParentFromPath = require("./parent_path.js");

test("empty", () => {
	expect(() => {
		getParentFromPath();
	}).toThrow();
	expect(() => {
		getParentFromPath("");
	}).toThrow();
	expect(() => {
		getParentFromPath("   ");
	}).toThrow();
});

test("/", () => {
	expect(getParentFromPath("/")).toBe("");
	expect(getParentFromPath("/   ")).toBe("");
});

test("/2001", () => {
	expect(getParentFromPath("/2001")).toBe("/");
	expect(getParentFromPath("/2001   ")).toBe("/");
	expect(getParentFromPath("/2001/")).toBe("/");
	expect(getParentFromPath("/2001/   ")).toBe("/");
	expect(getParentFromPath("2001/")).toBe("/");
	expect(getParentFromPath("2001/    ")).toBe("/");
});

test("/2001/12-31", () => {
	expect(getParentFromPath("/2001/12-31")).toBe("/2001");
	expect(getParentFromPath("/2001/12-31/")).toBe("/2001");
	expect(getParentFromPath("2001/12-31")).toBe("/2001");
	expect(getParentFromPath("2001/12-31/")).toBe("/2001");
});

test("/2001/12-31/image.jpg", () => {
	expect(getParentFromPath("/2001/12-31/image.jpg")).toBe("/2001/12-31");
	expect(getParentFromPath("2001/12-31/image.jpg")).toBe("/2001/12-31");
	expect(getParentFromPath("2001/12-31/i.jpg")).toBe("/2001/12-31");
	expect(getParentFromPath("2001/12-31/i.j")).toBe("/2001/12-31");
	expect(getParentFromPath("2001/12-31/i.")).toBe("/2001/12-31");
	expect(getParentFromPath("2001/12-31/i")).toBe("/2001/12-31");
});

test("/some/random/long/path/should/work", () => {
	expect(getParentFromPath("/some/random/long/path/should/work")).toBe(
		"/some/random/long/path/should"
	);
	expect(getParentFromPath("/some/random/long/path/should/work/")).toBe(
		"/some/random/long/path/should"
	);
});

test("/some/random/long/path/should/work/image.jpg", () => {
	expect(
		getParentFromPath("/some/random/long/path/should/work/image.jpg")
	).toBe("/some/random/long/path/should/work");
});
