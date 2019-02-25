const fetch = require("node-fetch");

/**
 * Class to simplify working with the Gallery REST API
 */
class GalleryApi {
	/**
	 * @param {Object} stack something like {apiUrl: "", ...}
	 */
	constructor(stack) {
		this.stack = stack;
	}

	/**
	 * Fetch image in via API
	 *
	 * @returns image object, or undefined if image not found in the album
	 */
	async fetchImage(albumPath, imageName) {
		const albumResponse = await this.fetchExistingAlbum(albumPath);
		expect(Array.isArray(albumResponse.children)).toBeTruthy();
		return GalleryApi.findImage(albumResponse.children, imageName);
	}

	/**
	 * Find image in array of images and albums
	 *
	 * @param {Array} children array of an album's child images as returned from API
	 * @param {*} imageName like "image.jpg"
	 * @returns the named image in the array of children, or undefined if not found
	 */
	static findImage(children, imageName) {
		return GalleryApi.findChild(children, imageName);
	}

	/**
	 * Find child album in array of images and albums
	 *
	 * @param {Array} children array of an album's child images as returned from API
	 * @param {*} imageName like "image.jpg"
	 * @returns the named image in the array of children, or undefined if not found
	 */
	static findAlbum(children, imageName) {
		return GalleryApi.findChild(children, imageName);
	}

	/**
	 * Find child in array of images and albums
	 *
	 * @param {Array} children array of an album's child images as returned from API
	 * @param {*} childName like "image.jpg"
	 * @returns the named image in the array of children, or undefined if not found
	 */
	static findChild(children, childName) {
		return children.find(child => {
			return child.itemName === childName;
		});
	}

	/**
	 * Fetch album, failing if album doesn't exist
	 *
	 * @param {String} albumPath path of album like 2001/12-31/
	 * @returns album object of format {album: Object, children: object}
	 */
	async fetchExistingAlbum(albumPath) {
		const response = await this.fetchAlbum(albumPath);

		// Did I get a HTTP 200?
		expect(response).toBeDefined();
		expect(response.status).toBeDefined();
		expect(response.status).toBe(200);

		// Fetch body and return entire response as JSON
		return await response.json();
	}

	/**
	 * Fetch nonexistent album, failing if I don't get a 404
	 *
	 * @returns response object including JSON body
	 */
	async fetchNonexistentAlbum(albumPath) {
		const response = await this.fetchAlbum(albumPath);

		// Did I get a HTTP 404?
		expect(response).toBeDefined();
		expect(response.status).toBe(404);

		// Fetch body and return entire response as JSON
		return await response.json();
	}

	/**
	 * Fetch album without checking whether it's a success or failure
	 *
	 * @returns response with body not yet resolved.  You have to do that yourself with response.json()
	 */
	async fetchAlbum(albumPath) {
		const albumUrl = this.stack.apiUrl + "/album/" + albumPath;
		const response = await fetch(albumUrl);
		return response;
	}

	/**
	 * Fetch latest album
	 *
	 * @returns album object of format {album: Object, children: object}
	 */
	async fetchLatestAlbum() {
		const albumUrl = this.stack.apiUrl + "/latest-album";
		const response = await fetch(albumUrl);

		// Did I get a HTTP 200?
		expect(response).toBeDefined();
		expect(response.status).toBeDefined();
		expect(response.status).toBe(200);

		// Fetch body and return entire response as JSON
		return await response.json();
	}
}
module.exports = GalleryApi;
