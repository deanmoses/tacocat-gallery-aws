//
// Test fixture data
// Albums and images defined here need to exist before the tests run
//

let fixture = {
	year: "2001",
	week: "01-31",
	image: "test_image_1.jpg"
};
fixture.yearAlbumPath = fixture.year + "/";
fixture.weekAlbumPath = fixture.yearAlbumPath + fixture.week + "/";
fixture.imagePath = fixture.weekAlbumPath + fixture.image;

module.exports = fixture;
