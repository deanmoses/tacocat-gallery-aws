const pth = require("./get_parent_and_name_from_path.js");

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
	expect(pth("/").name).toBe("");
	expect(pth("/").parent).toBe("");
	expect(pth("/   ").name).toBe("");
	expect(pth("/   ").parent).toBe("");
});

test("/2001", () => {
	expect(pth("/2001").name).toBe("2001");
	expect(pth("/2001").parent).toBe("/");
	expect(pth("/2001   ").name).toBe("2001");
	expect(pth("/2001   ").parent).toBe("/");
	expect(pth("/2001/").name).toBe("2001");
	expect(pth("/2001/").parent).toBe("/");
	expect(pth("/2001/   ").name).toBe("2001");
	expect(pth("/2001/   ").parent).toBe("/");
	expect(pth("2001/").name).toBe("2001");
	expect(pth("2001/").parent).toBe("/");
	expect(pth("2001/    ").name).toBe("2001");
	expect(pth("2001/    ").parent).toBe("/");
});

test("/2001/12-31", () => {
	expect(pth("/2001/12-31").name).toBe("12-31");
	expect(pth("/2001/12-31").parent).toBe("/2001/");
	expect(pth("/2001/12-31/").name).toBe("12-31");
	expect(pth("/2001/12-31/").parent).toBe("/2001/");
	expect(pth("2001/12-31").name).toBe("12-31");
	expect(pth("2001/12-31").parent).toBe("/2001/");
	expect(pth("2001/12-31/").name).toBe("12-31");
	expect(pth("2001/12-31/").parent).toBe("/2001/");
});

test("/2001/12-31/image.jpg", () => {
	expect(pth("/2001/12-31/image.jpg").name).toBe("image.jpg");
	expect(pth("/2001/12-31/image.jpg").parent).toBe("/2001/12-31/");
	expect(pth("2001/12-31/image.jpg").name).toBe("image.jpg");
	expect(pth("2001/12-31/image.jpg").parent).toBe("/2001/12-31/");
	expect(pth("2001/12-31/i.jpg").name).toBe("i.jpg");
	expect(pth("2001/12-31/i.jpg").parent).toBe("/2001/12-31/");
	expect(pth("2001/12-31/i.j").name).toBe("i.j");
	expect(pth("2001/12-31/i.j").parent).toBe("/2001/12-31/");
	expect(pth("2001/12-31/i.").name).toBe("i.");
	expect(pth("2001/12-31/i.").parent).toBe("/2001/12-31/");
	expect(pth("2001/12-31/i").name).toBe("i");
	expect(pth("2001/12-31/i").parent).toBe("/2001/12-31/");
});

test("/some/random/long/path/should/work", () => {
	expect(pth("/some/random/long/path/should/work").name).toBe("work");
	expect(pth("/some/random/long/path/should/work").parent).toBe(
		"/some/random/long/path/should/"
	);
	expect(pth("/some/random/long/path/should/work/").name).toBe("work");
	expect(pth("/some/random/long/path/should/work/").parent).toBe(
		"/some/random/long/path/should/"
	);
});

test("/some/random/long/path/should/work/image.jpg", () => {
	expect(pth("/some/random/long/path/should/work/image.jpg").name).toBe(
		"image.jpg"
	);
	expect(pth("/some/random/long/path/should/work/image.jpg").parent).toBe(
		"/some/random/long/path/should/work/"
	);
});
