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
describe.only("Update albums via API", async () => {
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
		const newTitle = "Updated Title " + JestUtils.generateRandomInt();
		const newDescription =
			"Updated Description " + JestUtils.generateRandomInt();
		const albumPath = fix.getYearPath();

		// Album title should NOT be new title yet
		let response = await api.fetchExistingAlbum(albumPath);
		expect(response.album.title).not.toBe(newTitle);
		expect(response.album.description).not.toBe(newDescription);

		// Update title
		await galleryApiJestHelper.expectUpdateAlbumSuccess(albumPath, {
			title: newTitle,
			description: newDescription
		});

		// Album title should be new title now
		response = await api.fetchExistingAlbum(albumPath);
		expect(response.album.title).toBe(newTitle);
		expect(response.album.description).toBe(newDescription);
	});

	test("Existing week album", async () => {
		const newTitle = "Updated Title " + JestUtils.generateRandomInt();
		const newDescription =
			"Updated Description " + JestUtils.generateRandomInt();
		const albumPath = fix.getWeekPath();

		// Album title should NOT be new title yet
		let response = await api.fetchExistingAlbum(albumPath);
		expect(response.album.title).not.toBe(newTitle);
		expect(response.album.description).not.toBe(newDescription);

		// Update title
		await galleryApiJestHelper.expectUpdateAlbumSuccess(albumPath, {
			title: newTitle,
			description: newDescription
		});

		// Album title should be new title now
		response = await api.fetchExistingAlbum(albumPath);
		expect(response.album.title).toBe(newTitle);
		expect(response.album.description).toBe(newDescription);
	});

	test.only("Week thumbnail", async () => {
		const newThumbnail =
			"/2001/12-31/image_" + JestUtils.generateRandomInt() + ".jpg";
		const albumPath = fix.getWeekPath();

		// Update thumb
		await galleryApiJestHelper.expectUpdateAlbumSuccess(albumPath, {
			thumbnail: newThumbnail
		});

		// Album thumbnail should be new thumbnail now
		const response = await api.fetchExistingAlbum(albumPath);
		expect(response.album.thumbnail).toBe(newThumbnail);
	});
});
