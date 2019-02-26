const fetch = require("node-fetch");
const GalleryApiUtils = require("./GalleryApiUtils.js");
const aws4 = require("aws4");

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
		return GalleryApiUtils.findImage(albumResponse.children, imageName);
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
		return await fetch(this.albumUrl(albumPath));
	}

	/**
	 * Fetch latest album
	 *
	 * @returns album object of format {album: Object, children: object}
	 */
	async fetchLatestAlbum() {
		const response = await fetch(this.latestAlbumUrl());

		// Did I get a HTTP 200?
		expect(response).toBeDefined();
		expect(response.status).toBeDefined();
		expect(response.status).toBe(200);

		// Fetch body and return entire response as JSON
		return await response.json();
	}

	/**
	 * Update album
	 *
	 * @param {String} albumPath path of album like "2001/12-31/"
	 * @param {Object} attributesToUpdate like {title: "x", description: "y"}
	 * @returns response with body not yet resolved.  You have to do that yourself with response.json()
	 */
	async updateAlbum(albumPath, attributesToUpdate) {
		// Set up the HTTP PATCH with the AWS authentication headers
		const apiPath = "/prod/album/" + albumPath;
		const albumUrl = "https://" + this.stack.apiDomain + apiPath;
		const unsignedFetchParams = {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json"
			},
			path: apiPath,
			host: this.stack.apiDomain,
			body: JSON.stringify(attributesToUpdate)
		};

		const credentials = {
			accessKeyId: this.stack.accessKey,
			secretAccessKey: this.stack.secretKey
		};

		const signedFetchParams = aws4.sign(unsignedFetchParams, credentials);

		//  Do the HTTP PATCH
		const response = await fetch(albumUrl, signedFetchParams);

		// if the API returned a 403 Not Authorized
		if (response.status === 403) {
			// print out debugging info about the request signing
			/* eslint-disable no-console */
			console.log("credentials", credentials);
			console.log("unsigned options for " + albumUrl, unsignedFetchParams);
			console.log("signed options for " + albumUrl, signedFetchParams);

			// The API Gateway returns very helpful info in the body about what it was expecting
			// the signed request's format to be
			const body = await response.json();
			console.log("patchResult", body);

			// Print out what the actual request signing information was
			var signer = new aws4.RequestSigner(unsignedFetchParams, credentials);
			console.log("Actual Canonical String", signer.canonicalString());
			console.log("Actual String-to-Sign", signer.stringToSign());
			/* eslint-enable no-console */
		}

		return response;
	}

	/**
	 * Generate URL to album endpoint
	 *
	 * @param {String} albumPath  like "/2001"
	 * @returns {String} fully qualified URL to the REST API album endpoint
	 */
	albumUrl(albumPath) {
		return this.stack.apiUrl + "/album/" + albumPath;
	}

	/**
	 * Fully qualified REST API URL to retrieve the latest album
	 */
	latestAlbumUrl() {
		return this.stack.apiUrl + "/latest-album";
	}
}
module.exports = GalleryApi;
