//
// An integration test that operates over pre-existing albums & images
//
// This test should only READ or UPDATE data; it shouldn't CREATE or DELETE albums or images
//
// I'm separating out read-only vs update vs full CRUD tests because
// reading data is cheaper than writing -- both in StepFunctions and DynamoDB.
// In January 2019 I ran this so much it nearly tapped out my AWS Free Tier
// of StepFunction executions!
//

const getStackConfiguration = require("./utils/get_stack_configuration.js");
const GalleryApi = require("./utils/GalleryApi.js");
const GalleryApiJestHelper = require("./utils/GalleryApiJestHelper.js");
const JestUtils = require("./utils/JestUtils.js");
const FixtureHelper = require("./utils/FixtureHelper.js");
const fixture = require("./utils/fixture_data.js");

// beforeAll will set these
let stack, galleryApiJestHelper, api, fix;

/**
 * UPDATE ALBUMS VIA API
 */
describe("Update albums via API", async () => {
	/**
	 * Get information about the CloudFormation stack
	 */
	beforeAll(async () => {
		stack = await getStackConfiguration();
		galleryApiJestHelper = new GalleryApiJestHelper(stack);
		api = new GalleryApi(stack);
		fix = new FixtureHelper(fixture);
	});

	test.skip("Root album", async () => {
		const response = await api.updateAlbum("", {
			title: "foo"
		});
		expect(response.status).toBe(400);
	});

	test("Nonexistent year album", async () => {
		await galleryApiJestHelper.expectUpdateAlbumNotFound("/1899", {
			title: "foo"
		});
	});

	test("Nonexistent week album", async () => {
		await galleryApiJestHelper.expectUpdateAlbumNotFound("/1899/02-01", {
			title: "foo"
		});
	});

	test("Existing year album", async () => {
		const albumPath = fix.getYearPath();

		// Un-set title
		await galleryApiJestHelper.expectUpdateAlbumSuccess(albumPath, {
			title: ""
		});

		// Album should not have title
		let response = await api.fetchExistingAlbum(albumPath);
		expect(response.album.title).toBeUndefined();

		// Update title
		const newTitle = "Title " + JestUtils.generateRandomInt();
		await galleryApiJestHelper.expectUpdateAlbumSuccess(albumPath, {
			title: newTitle
		});

		// Album title should be the new one
		response = await api.fetchExistingAlbum(albumPath);
		expect(response.album.title).toBe(newTitle);
	});

	test("Existing week album", async () => {
		const albumPath = fix.getWeekPath();

		// Un-set title and description
		await galleryApiJestHelper.expectUpdateAlbumSuccess(albumPath, {
			title: "",
			description: ""
		});

		// Album should not have title or description
		let response = await api.fetchExistingAlbum(albumPath);
		expect(response.album.title).toBeUndefined();
		expect(response.album.description).toBeUndefined();

		// Update title and description
		const newTitle = "Title " + JestUtils.generateRandomInt();
		const newDescription = "Desc " + JestUtils.generateRandomInt();
		await galleryApiJestHelper.expectUpdateAlbumSuccess(albumPath, {
			title: newTitle,
			description: newDescription
		});

		// Album title and description should be the new ones
		response = await api.fetchExistingAlbum(albumPath);
		expect(response.album.title).toBe(newTitle);
		expect(response.album.description).toBe(newDescription);
	});

	test("Week thumbnail", async () => {
		const albumPath = fix.getWeekPath();

		// Un-set thumb
		await galleryApiJestHelper.expectUpdateAlbumSuccess(albumPath, {
			thumbnail: ""
		});

		// Album should not have thumbnail
		let response = await api.fetchExistingAlbum(albumPath);
		expect(response.album.thumbnail).toBeUndefined();

		// Set new thumb
		const newThumbnail = fix.getImagePath();
		await galleryApiJestHelper.expectUpdateAlbumSuccess(albumPath, {
			thumbnail: newThumbnail
		});

		// Album thumbnail should be the new one
		response = await api.fetchExistingAlbum(albumPath);
		expect(response.album.thumbnail).toBe(newThumbnail);
	});
});
