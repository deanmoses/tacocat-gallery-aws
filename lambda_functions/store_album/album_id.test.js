const getAlbumPathFromS3key = require("./album_id.js");

test("albums/", () => {
	expect(getAlbumPathFromS3key("albums/")).toBe("");
});

test("albums/2001/", () => {
	expect(getAlbumPathFromS3key("albums/2001/")).toBe("2001");
});

test("albums/2001/12-31/", () => {
	expect(getAlbumPathFromS3key("albums/2001/12-31/")).toBe("2001/12-31");
});
