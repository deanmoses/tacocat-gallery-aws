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
		JestUtils.expectNonEmptyString(item.itemName);
		JestUtils.expectNonEmptyString(item.parentPath);
		JestUtils.expectValidDate(item.updateDateTime);
	}

	/**
	 * Expect valid next/prev album
	 *
	 * @param {Object} item next or prev item as passed by API
	 */
	static expectValidNextPrevAlbum(item) {
		expect(item).toBeDefined();
		JestUtils.expectNonEmptyString(item.itemName);
		JestUtils.expectNonEmptyString(item.parentPath);
	}

	/**
	 * Expect year itemName like "2001"
	 * @param {String} itemName
	 */
	static expectValidYearItemName(itemName) {
		expect(itemName).toMatch(/^\d\d\d\d$/);
	}

	/**
	 * Expect week itemName like "12-31"
	 * @param {String} itemName
	 */
	static expectValidWeekItemName(itemName) {
		expect(itemName).toMatch(/^\d\d-\d\d$/);
	}

	/**
	 * Expect year album path like "/2001/"?
	 * @param {String} path
	 */
	static expectValidYearPath(path) {
		expect(path).toMatch(/^\/\d\d\d\d\/$/);
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

	/**
	 * Expect it to be a non-empty string
	 * @param {String} s
	 */
	static expectNonEmptyString(s) {
		expect(s).toBeDefined();
		expect(typeof s).toBe("string");
		expect(s.length).toBeGreaterThan(0);
	}

	/**
	 * Generate a random integer suitable for making unique titles and paths and such
	 */
	static generateRandomInt() {
		return Math.floor(Math.random() * 100000);
	}
}
module.exports = JestUtils;
