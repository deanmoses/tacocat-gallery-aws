const GalleryApiUtils = require("./GalleryApiUtils.js");
const PathUtils = require("./PathUtils.js");
const schemas = require("./gallery_schema.js");
const { matchers } = require("jest-json-schema");

expect.extend(matchers); // add JSON schema matcher to Jest expect statement

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
	static expectChildAlbumToExist(children, albumName) {
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
	 * Expect valid album response of format {album: {}, children: []}
	 *
	 * Does not work for the root gallery, which has a different shape
	 *
	 * @param {Object} albumResponse as returned from API
	 */
	static expectValidAlbumResponse(albumResponse) {
		expect(albumResponse).toMatchSchema(schemas.albumResponseSchema);
	}

	/**
	 * Expect album to be valid
	 *
	 * Does not work for the root gallery, which has a different shape
	 *
	 * @param {Object} album as returned from API
	 */
	static expectValidAlbum(album) {
		expect(album).toMatchSchema(schemas.albumSchema);
	}

	/**
	 * Expect image to be valid
	 *
	 * @param {Object} image as returned from API
	 */
	static expectValidImage(image) {
		expect(image).toMatchSchema(schemas.imageSchema);
	}

	/**
	 * Expect valid next/prev album item
	 *
	 * @param {Object} prevNextAlbum next or prev album item as passed by API
	 */
	static expectValidPrevNextAlbum(prevNextAlbum) {
		expect(prevNextAlbum).toMatchSchema(schemas.prevNextAlbumSchema);
	}

	/**
	 * Expect year album itemName like "2001"
	 * @param {String} itemName
	 */
	static expectValidYearAlbumName(itemName) {
		expect(itemName).toMatchSchema(schemas.yearAlbumNameSchema);
	}

	/**
	 * Expect week album itemName like "12-31"
	 * @param {String} itemName
	 */
	static expectValidWeekAlbumName(itemName) {
		expect(itemName).toMatchSchema(schemas.weekAlbumNameSchema);
	}

	/**
	 * Expect year album path like "/2001/"
	 * @param {String} path
	 */
	static expectValidYearAlbumPath(path) {
		expect(path).toMatchSchema(schemas.yearAlbumPathSchema);
	}

	/**
	 * Expect week album path like "/2001/12-31/"
	 * @param {String} path
	 */
	static expectValidWeekAlbumPath(path) {
		expect(path).toMatchSchema(schemas.weekAlbumPathSchema);
	}

	/**
	 * Expect valid album path like / or /2001 or /2001/12-31/
	 * @param {String} path
	 */
	static expectValidAlbumPath(path) {
		expect(path).toMatchSchema(schemas.albumPath);
	}

	/**
	 * Expect string in ISO 8601 format date like "2001-12-31T23:59:59.999Z"
	 * @param {String} d date string
	 */
	static expectValidDate(d) {
		expect(d).toBeDefined();
		expect(d).toMatch(PathUtils.getDateRegex());
	}

	/**
	 * Expect all the attributes to match
	 * Fail if any attribute does not match exactly
	 *
	 * @param {Object} obj any javascript object
	 * @param {Object} attributesToMatch like {title: "x", description: "y"}
	 */
	static expectAttributesToMatch(obj, attributesToMatch) {
		for (const key in attributesToMatch) {
			const expectedValue = attributesToMatch[key];
			expect(obj[key]).toBe(expectedValue);
		}
	}

	/**
	 * Expect none of the attributes to match
	 * Fail if any attribute matches exactly
	 *
	 * @param {Object} obj any javascript object
	 * @param {Object} attributesToNotMatch like {title: "x", description: "y"}
	 */
	static expectAttributesToNotMatch(obj, attributesToNotMatch) {
		for (const key in attributesToNotMatch) {
			const expectedValue = attributesToNotMatch[key];
			expect(obj[key]).not.toBe(expectedValue);
		}
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
