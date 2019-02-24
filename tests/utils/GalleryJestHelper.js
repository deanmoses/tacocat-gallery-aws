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
	 * Fail if album isn't in API
	 */
	async expectAlbumToBeInApi(albumPath) {
		const albumResponse = await this.api.fetchExistingAlbum(albumPath);

		expect(albumResponse.album).toBeDefined();

		// Is date the expected format?
		expect(this.isIso8601(albumResponse.album.updateDateTime)).toBeTruthy();

		return albumResponse;
	}

	/**
	 * Fail if album *is* in API
	 */
	async expectAlbumToNotBeInApi(albumPath) {
		await this.api.fetchNonexistentAlbum(albumPath);
	}

	/**
	 * @returns true if string is a ISO 8601 format date, which ends in a Z.
	 */
	isIso8601(d) {
		return !!d && d.length > 0 && d.lastIndexOf("Z") === d.length - 1;
	}
}
module.exports = GalleryJestHelper;
