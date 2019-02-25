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
}
module.exports = GalleryApiJestHelper;
