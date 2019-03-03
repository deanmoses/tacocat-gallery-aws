const fetch = require("node-fetch");
const GalleryApiUtils = require("./GalleryApiUtils.js");
const PathUtils = require("./PathUtils.js");
const aws4 = require("aws4");
const assert = require("assert");

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
	async fetchImage(imagePath) {
		PathUtils.assertIsImagePath(imagePath);
		const pathParts = PathUtils.getParentAndNameFromPath(imagePath);
		const albumPath = pathParts.parent;
		const imageName = pathParts.name;
		const albumResponse = await this.fetchExistingAlbum(albumPath);
		expect(Array.isArray(albumResponse.children)).toBeTruthy();
		return GalleryApiUtils.findImage(albumResponse.children, imageName);
	}

	/**
	 * Fetch album, failing if album doesn't exist
	 *
	 * @param {String} albumPath path of album like 2001/12-31
	 * @returns album object of format {album: Object, children: object}
	 */
	async fetchExistingAlbum(albumPath) {
		const response = await this.fetchAlbum(albumPath);
		expect(response).toBeDefined();
		expect(response.status).toBeDefined();
		const responseBody = await response.json();
		if (response.status !== 200) {
			// eslint-disable-next-line no-console
			console.log(
				"Fetch album (" + albumPath + ") response body",
				responseBody
			);
		}
		expect(response.status).toBe(200);
		return responseBody;
	}

	/**
	 * Fetch nonexistent album, failing if I don't get a 404
	 *
	 * @returns response object including JSON body
	 */
	async fetchNonexistentAlbum(albumPath) {
		validateAlbumPath(albumPath);
		const response = await this.fetchAlbum(albumPath);
		expect(response).toBeDefined();
		const responseBody = await response.json();
		if (response.status !== 404) {
			// eslint-disable-next-line no-console
			console.log(
				"Fetch album (" + albumPath + ") response body",
				responseBody
			);
		}
		expect(response.status).toBe(404);
		return responseBody;
	}

	/**
	 * Fetch album without checking whether it's a success or failure
	 *
	 * @returns response with body not yet resolved.  You have to do that yourself with response.json()
	 */
	async fetchAlbum(albumPath) {
		let path = albumPath;
		if (path === "/") {
			path = "";
		} else {
			validateAlbumPath(path);
		}
		path = this.stack.apiUrl + "/album" + path + "/";
		return await fetch(path);
	}

	/**
	 * Fetch latest album
	 *
	 * @returns album object of format {album: Object, children: object}
	 */
	async fetchLatestAlbum() {
		const response = await fetch(this.latestAlbumUrl());
		expect(response).toBeDefined();
		expect(response.status).toBeDefined();
		const responseBody = await response.json();
		if (response.status !== 200) {
			// eslint-disable-next-line no-console
			console.log(
				"Fetch latest album (" + this.latestAlbumUrl() + ") response body",
				responseBody
			);
		}
		expect(response.status).toBe(200);
		return responseBody;
	}

	/**
	 * Update album
	 *
	 * @param {String} albumPath path of album like "/2001/12-31"
	 * @param {Object} attributesToUpdate like {title: "x", description: "y"}
	 * @returns response with body not yet resolved.  You have to do that yourself with response.json()
	 */
	async updateAlbum(albumPath, attributesToUpdate) {
		let path = albumPath;
		if (path === "/") {
			path = "";
		} else {
			validateAlbumPath(path);
		}

		//
		// Set up the HTTP PATCH with the AWS authentication headers
		//

		// The apiPath is encoded, for security, and has to be exactly the path
		const apiPath = "/prod/album" + path + "/";

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

		expect(response).toBeDefined();

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
	 * Update image in DynamoDB
	 *
	 * @param {String} imagePath path of image like "/2001/12-31/image.jpg"
	 * @param {Object} attributesToUpdate like {title: "x", description: "y"}
	 * @returns response with body not yet resolved.  You have to do that yourself with response.json()
	 */
	async updateImage(imagePath, attributesToUpdate) {
		PathUtils.assertIsImagePath(imagePath);

		// Set up the HTTP PATCH with the AWS authentication headers
		const apiPath = "/prod/image" + imagePath;
		const imageUrl = "https://" + this.stack.apiDomain + apiPath;
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
		const response = await fetch(imageUrl, signedFetchParams);

		expect(response).toBeDefined();

		// if the API returned a 403 Not Authorized
		if (response.status === 403) {
			// print out debugging info about the request signing
			/* eslint-disable no-console */
			console.log("credentials", credentials);
			console.log("unsigned options for " + imageUrl, unsignedFetchParams);
			console.log("signed options for " + imageUrl, signedFetchParams);

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
	 * Fully qualified REST API URL to retrieve the latest album
	 */
	latestAlbumUrl() {
		return this.stack.apiUrl + "/latest-album";
	}
}
module.exports = GalleryApi;

function validateAlbumPath(albumPath) {
	assert(!!albumPath, "albumPath not defined");
	PathUtils.assertIsAlbumPath(albumPath);
	assert(
		!albumPath.endsWith("/"),
		"album path (" + albumPath + ") shouldn't end in a /"
	);
}
