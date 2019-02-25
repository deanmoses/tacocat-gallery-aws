const GalleryApiUtils = require("./GalleryApiUtils.js");

/**
 * Static class with static functions to help with Jest testing
 */
class JestUtils {
	/**
	 * Expect child album to exist in array of images and albums
	 *
	 * @param {Array} children array of an album's child images as returned from API
	 * @param {*} albumName like "2001" or "12-31": not this is NOT a path
	 * @returns the named album, or undefined if not found
	 */
	static expectAlbumToExist(children, albumName) {
		const album = GalleryApiUtils.findImage(children, albumName);
		JestUtils.expectValidAlbum(album);
	}

	/**
	 * Expect image to exist in array of images and albums
	 *
	 * @param {Array} children array of an album's child images and albums as returned from API
	 * @param {*} imageName like "image.jpg"
	 * @returns the named image, or undefined if not found
	 */
	static expectImageToExist(children, imageName) {
		const image = GalleryApiUtils.findImage(children, imageName);
		JestUtils.expectValidImage(image);
	}

	/**
	 * Expect album to be valid
	 *
	 * @param {Object} album as returned from API
	 */
	static expectValidAlbum(album) {
		JestUtils.expectValidItem(album);
	}

	/**
	 * Expect image to be valid
	 *
	 * @param {Object} image as returned from API
	 */
	static expectValidImage(image) {
		JestUtils.expectValidItem(image);
	}

	/**
	 * Expect album or image to be valid
	 *
	 * @param {Object} item album or image item as returned from API
	 */
	static expectValidItem(item) {
		expect(item).toBeDefined();
		expect(item.itemName).toBeDefined();
		expect(typeof item.itemName).toBe("string");
		JestUtils.expectValidDate(item.updateDateTime);
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
	 * Expect it to be a valid array
	 * @param {Array} arr
	 */
	static expectValidArray(arr) {
		expect(arr).toBeDefined();
		expect(Array.isArray(arr)).toBeTruthy();
	}
}
module.exports = JestUtils;
