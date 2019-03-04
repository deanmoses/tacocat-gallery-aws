const pth = require("./getNameFromPath.js");

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
	expect(pth("/2001")).toBe("2001");
	expect(pth("/2001   ")).toBe("2001");
	expect(pth("/2001/")).toBe("2001");
	expect(pth("/2001/   ")).toBe("2001");
	expect(pth("2001/")).toBe("2001");
	expect(pth("2001/    ")).toBe("2001");
});

test("/2001/12-31", () => {
	expect(pth("/2001/12-31")).toBe("12-31");
	expect(pth("/2001/12-31/")).toBe("12-31");
	expect(pth("2001/12-31")).toBe("12-31");
	expect(pth("2001/12-31/")).toBe("12-31");
});

test("/2001/12-31/image.jpg", () => {
	expect(pth("/2001/12-31/image.jpg")).toBe("image.jpg");
	expect(pth("2001/12-31/image.jpg")).toBe("image.jpg");
	expect(pth("2001/12-31/i.jpg")).toBe("i.jpg");
	expect(pth("2001/12-31/i.j")).toBe("i.j");
	expect(pth("2001/12-31/i.")).toBe("i.");
	expect(pth("2001/12-31/i")).toBe("i");
});

test("/some/random/long/path/should/work", () => {
	expect(pth("/some/random/long/path/should/work")).toBe("work");
	expect(pth("/some/random/long/path/should/work/")).toBe("work");
});

test("/some/random/long/path/should/work/image.jpg", () => {
	expect(pth("/some/random/long/path/should/work/image.jpg")).toBe("image.jpg");
});
