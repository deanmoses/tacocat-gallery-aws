const GalleryApi = require("./GalleryApi.js");

/**
 * Class to simplify Jest testing the Gallery API
 */
class GalleryJestHelper {
	/**
	 * @param {Object} stack something like {apiUrl: "", ...}
	 */
	constructor(stack) {
		this.stack = stack;
		expect(stack.originalImagePrefix).toBe("albums");
		expect(stack.thumbnailImagePrefix).toBe("thumb");
		expect(stack.largeImagePrefix).toBe("large");
		expect(stack.cloudFrontUrl).toContain("https://");
		this.api = new GalleryApi(stack);
	}

	/**
	 * Fail if image isn't in API
	 */
	async expectImageToBeInApi() {
		const image = await this.api.fetchImage();
		expect(image).toBeDefined();
		// Is date the expected format?
		expect(GalleryJestHelper.isIso8601(image.updateDateTime)).toBeTruthy();
	}

	/**
	 * Fail if album isn't in API
	 */
	async expectAlbumToBeInApi(albumPath) {
		const albumResponse = await this.api.fetchExistingAlbum(albumPath);

		expect(albumResponse.album).toBeDefined();

		// Is date the expected format?
		expect(
			GalleryJestHelper.isIso8601(albumResponse.album.updateDateTime)
		).toBeTruthy();
	}

	/**
	 * Fail if album *is* in API
	 */
	async expectAlbumToNotBeInApi(albumPath) {
		await this.api.fetchNonexistentAlbum(albumPath);
	}

	/**
	 * Expect it to be a valid array
	 * @param {Array} arr
	 */
	static expectValidArray(arr) {
		expect(arr).toBeDefined();
		expect(Array.isArray(arr)).toBeTruthy();
	}

	/**
	 * Expect child album to exist in array of images and albums
	 *
	 * @param {Array} children array of an album's child images as returned from API
	 * @param {*} albumName like "2001" or "12-31": not this is NOT a path
	 * @returns the named album, or undefined if not found
	 */
	static expectAlbumToExist(children, albumName) {
		const album = GalleryApi.findImage(children, albumName);
		GalleryJestHelper.expectValidAlbum(album);
	}

	/**
	 * Expect image to exist in array of images and albums
	 *
	 * @param {Array} children array of an album's child images and albums as returned from API
	 * @param {*} imageName like "image.jpg"
	 * @returns the named image, or undefined if not found
	 */
	static expectImageToExist(children, imageName) {
		const image = GalleryApi.findImage(children, imageName);
		GalleryJestHelper.expectValidImage(image);
	}

	/**
	 * Expect album to be valid
	 *
	 * @param {Object} album as returned from API
	 */
	static expectValidAlbum(album) {
		GalleryJestHelper.expectValidItem(album);
	}

	/**
	 * Expect image to be valid
	 *
	 * @param {Object} image as returned from API
	 */
	static expectValidImage(image) {
		GalleryJestHelper.expectValidItem(image);
	}

	/**
	 * Expect album or image to be valid
	 *
	 * @param {Object} item album or image item as returned from API
	 */
	static expectValidItem(item) {
		expect(item).toBeDefined();
		expect(item.updateDateTime).toBeDefined();
		expect(GalleryJestHelper.isIso8601(item.updateDateTime)).toBeTruthy();
	}

	/**
	 * Expect week itemName like "12-31"
	 * @param {String} weekItemName
	 */
	static expectValidWeekItemName(weekItemName) {
		expect(weekItemName).toMatch(/^\d\d-\d\d$/);
	}

	/**
	 * Expect year album path like "/2001/"?
	 * @param {String} yearPath
	 */
	static expectValidYearPath(yearPath) {
		expect(yearPath).toMatch(/^\/\d\d\d\d\/$/);
	}

	/**
	 * Expect string in ISO 8601 format date like "2001-12-31T23:59:59.999Z"
	 * @param {String} d date string
	 */
	static expectValidDate(d) {
		expect(d).toBeDefined();
		expect(d).toMatch(/\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d.\d\d\dZ/);
	}

	/**
	 * @returns true if string is a ISO 8601 format date like "2001-12-31T23:59:59Z"
	 */
	static isIso8601(d) {
		return !!d && d.length > 0 && d.lastIndexOf("Z") === d.length - 1;
	}
}
module.exports = GalleryJestHelper;
