const getAlbumId = require("./album_id.js");

test("albums/", () => {
	expect(getAlbumId("albums/")).toBe("");
});

test("albums/2001/", () => {
	expect(getAlbumId("albums/2001/")).toBe("2001");
});

test("albums/2001/12-31/", () => {
	expect(getAlbumId("albums/2001/12-31/")).toBe("2001/12-31");
});
