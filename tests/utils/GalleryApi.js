const fetch = require("node-fetch");

/**
 * Class to simplify working with the Gallery REST API
 */
class GalleryApi {
	/**
	 * @param {Object} stack something like {apiUrl: "", ...}
	 * @param {String} apiDomain domain of API like n67w5g5qe1.execute-api.us-west-2.amazonaws.com
	 */
	constructor(stack) {
		this.stack = stack;
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

		// Return response as JSON
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

		// Return response as JSON
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
}
module.exports = GalleryApi;
