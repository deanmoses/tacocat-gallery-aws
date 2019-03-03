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
const GalleryApi = require("./utils/GalleryApi.js");
const GalleryApiJestHelper = require("./utils/GalleryApiJestHelper.js");
const JestUtils = require("./utils/JestUtils.js");
const FixtureHelper = require("./utils/FixtureHelper.js");
const fixture = require("./utils/fixture_data.js");

// beforeAll will set these
let stack, galleryApiJestHelper, api, fix;

/**
 * RETREIVE ALBUMS VIA API
 */
describe("Retrieve albums via API", async () => {
	/**
	 * Get information about the CloudFormation stack
	 */
	beforeAll(async () => {
		stack = await getStackConfiguration();
		galleryApiJestHelper = new GalleryApiJestHelper(stack);
		api = new GalleryApi(stack);
		fix = new FixtureHelper(fixture);
	});

	test("Root album", async () => {
		const albumResponse = await api.fetchExistingAlbum("/");

		// Is root album of the expected format?
		const album = albumResponse.album;
		expect(album.title).toBe("Dean, Lucie, Felix and Milo Moses");
		expect(album.itemName).toBe("/");
		expect(album.parentPath).toBe("");

		// Do I have the expected child year albums?
		const children = albumResponse.children;
		JestUtils.expectValidArray(children);
		JestUtils.expectChildAlbumToExist(children, fixture.current.year);
		JestUtils.expectChildAlbumToExist(children, fixture.prev.year);
		JestUtils.expectChildAlbumToExist(children, fixture.next.year);
	});
	test("Nonexistent year album", async () => {
		await galleryApiJestHelper.expectAlbumToNotBeInApi("/1899");
	});

	test("Nonexistent week album", async () => {
		await galleryApiJestHelper.expectAlbumToNotBeInApi("/1899/02-01");
	});

	test("Year album exists", async () => {
		const albumResponse = await api.fetchExistingAlbum(fix.getYearPath());
		const album = albumResponse.album;
		JestUtils.expectValidAlbum(album);
		JestUtils.expectValidYearAlbumName(album.itemName);
		expect(album.parentPath).toBe("/");

		JestUtils.expectValidPrevNextAlbum(albumResponse.nextAlbum);
		JestUtils.expectValidPrevNextAlbum(albumResponse.prevAlbum);
	});

	test("Week album exists", async () => {
		await galleryApiJestHelper.expectAlbumToBeInApi(fix.getWeekPath());
	});
});
