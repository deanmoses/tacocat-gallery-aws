const GalleryApi = require("./GalleryApi.js");
const JestUtils = require("./JestUtils.js");

/**
 * Class to simplify Jest testing the Gallery API
 */
class GalleryApiJestHelper {
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
		JestUtils.expectValidImage(image);
	}

	/**
	 * Fail if album isn't in API
	 */
	async expectAlbumToBeInApi(albumPath) {
		const albumResponse = await this.api.fetchExistingAlbum(albumPath);
		JestUtils.expectValidAlbum(albumResponse.album);
	}

	/**
	 * Fail if album *is* in API
	 */
	async expectAlbumToNotBeInApi(albumPath) {
		await this.api.fetchNonexistentAlbum(albumPath);
	}

	/**
	 * Expect success when updating album
	 *
	 * @param {String} albumPath path of album like "2001/12-31/"
	 * @param {Object} attributesToUpdate like {title: "x", description: "y"}
	 */
	async expectUpdateAlbumSuccess(albumPath, attributesToUpdate) {
		const response = await this.api.updateAlbum(albumPath, attributesToUpdate);

		// Verify update was a success
		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const responseBody = await response.json();
		expect(responseBody.message).toBe("Updated");
	}

	/**
	 * Expect a 404 Not Found attempting to update album
	 *
	 * @param {String} albumPath path of album like "2001/12-31/"
	 * @param {Object} attributesToUpdate like {title: "x", description: "y"}
	 */
	async expectUpdateAlbumNotFound(albumPath, attributesToUpdate) {
		const response = await this.api.updateAlbum(albumPath, attributesToUpdate);

		// Verify update returned a 404 Not Found
		expect(response).toBeDefined();
		expect(response.status).toBe(404);
	}
}
module.exports = GalleryApiJestHelper;
