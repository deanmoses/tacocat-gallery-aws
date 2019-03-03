const GalleryApi = require("./GalleryApi.js");
const JestUtils = require("./JestUtils.js");
const PathUtils = require("./PathUtils.js");

/**
 * Class to simplify Jest testing the Gallery API
 */
class GalleryApiJestHelper {
	/**
	 * @param {Object} stack CloudFormation configuration info object, something like {apiUrl: "", ...}
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
	 * Retrieve album.  Fail if any attribute do not match exactly
	 *
	 * @param {String} albumPath path of album like 2001/12-31/
	 * @param {Object} attributesToMatch like {title: "x", description: "y"}
	 */
	async expectAlbumAttributesToMatch(albumPath, attributesToMatch) {
		expect(albumPath).toBeDefined();
		expect(attributesToMatch).toBeDefined();
		const albumResponse = await this.getAndValidateAlbum(albumPath);
		JestUtils.expectAttributesToMatch(albumResponse.album, attributesToMatch);
	}

	/**
	 * Retrieve album.  Fail if any attribute matches exactly
	 *
	 * @param {String} albumPath path of album like 2001/12-31/
	 * @param {Object} attributesToNotMatch like {title: "x", description: "y"}
	 */
	async expectAlbumAttributesToNotMatch(albumPath, attributesToNotMatch) {
		expect(albumPath).toBeDefined();
		expect(attributesToNotMatch).toBeDefined();
		const albumResponse = await this.getAndValidateAlbum(albumPath);
		JestUtils.expectAttributesToNotMatch(
			albumResponse.album,
			attributesToNotMatch
		);
	}

	/**
	 * Retrieve image.  Fail if any attribute does not match exactly
	 *
	 * @param {Object} attributesToMatch like {title: "x", description: "y"}
	 */
	async expectImageAttributesToMatch(imagePath, attributesToMatch) {
		expect(imagePath).toBeDefined();
		expect(attributesToMatch).toBeDefined();
		const image = await this.getAndValidateImage(imagePath);
		JestUtils.expectAttributesToNotMatch(image, attributesToMatch);
	}

	/**
	 * Retrieve image.  Fail if any attribute matches exactly
	 *
	 * @param {Object} attributesToNotMatch like {title: "x", description: "y"}
	 */
	async expectImageAttributesToNotMatch(imagePath, attributesToNotMatch) {
		expect(imagePath).toBeDefined();
		expect(attributesToNotMatch).toBeDefined();
		const image = await this.getAndValidateImage(imagePath);
		JestUtils.expectAttributesToNotMatch(image, attributesToNotMatch);
	}

	/**
	 * Fail if image isn't in API
	 *
	 * @param {String} imagePath absolute path of image like /2001/12-31/image.jpg
	 */
	async expectImageToBeInApi(imagePath) {
		await this.getAndValidateImage(imagePath);
	}

	/**
	 * Fail if image *is* in API
	 *
	 * @param {String} imagePath absolute path of image like /2001/12-31/image.jpg
	 */
	async expectImageToNotBeInApi(imagePath) {
		const image = await this.api.fetchImage(imagePath);
		expect(image).toBeUndefined();
	}

	/**
	 * Return image, failing if it isn't in the API
	 *
	 * @param {String} imagePath absolute path of image like /2001/12-31/image.jpg
	 * @return {Object} image
	 */
	async getAndValidateImage(imagePath) {
		const image = await this.api.fetchImage(imagePath);
		JestUtils.expectValidImage(image);
		return image;
	}

	/**
	 * Fail if album isn't in API
	 *
	 * @param {String} albumPath absolute path of album like /2001 or /2001/12-31
	 */
	async expectAlbumToBeInApi(albumPath) {
		await this.getAndValidateAlbum(albumPath);
	}

	/**
	 * Return album, failing if it isn't in the API
	 *
	 * @param {String} albumPath absolute path of album like /2001 or /2001/12-31
	 * @returns {Object} albumResponse as returned from the API
	 */
	async getAndValidateAlbum(albumPath) {
		const albumResponse = await this.api.fetchExistingAlbum(albumPath);
		JestUtils.expectValidAlbum(albumResponse.album);
		return albumResponse;
	}

	/**
	 * Fail if album *is* in API
	 *
	 * @param {String} albumPath absolute path of album like /2001 or /2001/12-31
	 */
	async expectAlbumToNotBeInApi(albumPath) {
		await this.api.fetchNonexistentAlbum(albumPath);
	}

	/**
	 * Expect success when updating album
	 *
	 * @param {String} albumPath path of album like "/2001/12-31/"
	 * @param {Object} attributesToUpdate like {title: "x", description: "y"}
	 */
	async expectUpdateAlbumSuccess(albumPath, attributesToUpdate) {
		PathUtils.assertIsAlbumPath(albumPath);

		const response = await this.api.updateAlbum(albumPath, attributesToUpdate);

		// Download the response body
		const responseBody = await response.json();

		// Verify update was a success
		expect(response).toBeDefined();
		if (response.status !== 200) {
			// eslint-disable-next-line no-console
			console.log("Update response body", responseBody);
		}
		expect(response.status).toBe(200);
		expect(responseBody.message).toBe("Updated");
	}

	/**
	 * Expect a 404 Not Found attempting to update album
	 *
	 * @param {String} albumPath path of album like "/2001/12-31/"
	 * @param {Object} attributesToUpdate like {title: "x", description: "y"}
	 */
	async expectUpdateAlbumNotFound(albumPath, attributesToUpdate) {
		const response = await this.api.updateAlbum(albumPath, attributesToUpdate);

		// Download the response body
		expect(response).toBeDefined();

		// Verify update returned a 404 Not Found
		const responseBody = await response.json();
		if (response.status !== 404) {
			// eslint-disable-next-line no-console
			console.log("Update response body", responseBody);
		}
		expect(response.status).toBe(404);
	}

	/**
	 * Expect success when updating image
	 *
	 * @param {String} imagePath path of image like "/2001/12-31/image.jpg"
	 * @param {Object} attributesToUpdate like {title: "x", description: "y"}
	 */
	async expectUpdateImageSuccess(imagePath, attributesToUpdate) {
		const response = await this.api.updateImage(imagePath, attributesToUpdate);
		expect(response).toBeDefined();

		// Download the response body
		const responseBody = await response.json();

		// If not 200, do some debugging
		if (response.status !== 200) {
			// eslint-disable-next-line no-console
			console.log("Update response body", responseBody);
		}
		expect(response.status).toBe(200);
		expect(responseBody.message).toBe("Updated");
	}

	/**
	 * Expect a 404 Not Found attempting to update image
	 *
	 * @param {String} imagePath path of image like "/2001/12-31/image.jpg"
	 * @param {Object} attributesToUpdate like {title: "x", description: "y"}
	 */
	async expectUpdateImageNotFound(imagePath, attributesToUpdate) {
		const response = await this.api.updateImage(imagePath, attributesToUpdate);
		expect(response).toBeDefined();

		// Download the response body
		const responseBody = await response.json();

		// If not 404, do some debugging
		if (response.status !== 404) {
			// eslint-disable-next-line no-console
			console.log("Update response body", responseBody);
		}
		expect(response.status).toBe(404);
	}
}
module.exports = GalleryApiJestHelper;
