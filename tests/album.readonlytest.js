//
// A read-only integration test that operates over pre-existing albums & images
//
// This test should only READ data; it shouldn't CREATE, MODIFY or DELETE albums or images
//
// I'm separating out read-only tests to be run more frequently because
// reading data is cheaper than writing -- both in StepFunctions and DynamoDB.
// In January 2019 I ran this so much it nearly tapped out my AWS Free Tier
// of StepFunction executions!
//

const getStackConfiguration = require("./utils/get_stack_configuration.js");
const GalleryJestHelper = require("./utils/GalleryJestHelper.js");
const GalleryApi = require("./utils/GalleryApi.js");
const fixture = require("./utils/test_fixture_data.js");

// beforeAll will set these
let stack, galleryJestHelper, galleryApi;

/**
 * RETREIVE ALBUMS VIA API
 */
describe("Retrieve albums via API", async () => {
	/**
	 * Get information about the CloudFormation stack
	 */
	beforeAll(async () => {
		stack = await getStackConfiguration();
		galleryJestHelper = new GalleryJestHelper(stack);
		galleryApi = new GalleryApi(stack);
	});

	test("Root album", async () => {
		const albumResponse = await galleryApi.fetchExistingAlbum("");
		expect(albumResponse.album.title).toBe("Dean, Lucie, Felix and Milo Moses");
		expect(albumResponse.children.length).toBeGreaterThanOrEqual(1);
		// TODO: find the fixture year album in the children
	});
	test("Nonexistent year album", async () => {
		await galleryJestHelper.expectAlbumToNotBeInApi("/1899");
	});

	test("Nonexistent week album", async () => {
		await galleryJestHelper.expectAlbumToNotBeInApi("/1899/02-01");
	});

	test("Year album exists: " + fixture.yearAlbumPath, async () => {
		await galleryJestHelper.expectAlbumToBeInApi(fixture.yearAlbumPath);
	});

	test("Week album exists: " + fixture.weekAlbumPath, async () => {
		await galleryJestHelper.expectAlbumToBeInApi(fixture.weekAlbumPath);
	});
});
