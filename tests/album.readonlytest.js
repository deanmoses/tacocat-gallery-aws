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
const FixtureHelper = require("./utils/FixtureHelper.js");
const fixture = require("./utils/fixture_data.js");

// beforeAll will set these
let stack, galleryJestHelper, galleryApi, fix;

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
		fix = new FixtureHelper(fixture);
	});

	test("Root album", async () => {
		const albumResponse = await galleryApi.fetchExistingAlbum("");
		expect(albumResponse.album.title).toBe("Dean, Lucie, Felix and Milo Moses");

		// Do I have the expected child year albums?
		const children = albumResponse.children;
		GalleryJestHelper.expectValidArray(children);
		GalleryJestHelper.expectAlbumToExist(children, fixture.current.year);
		GalleryJestHelper.expectAlbumToExist(children, fixture.prev.year);
		GalleryJestHelper.expectAlbumToExist(children, fixture.next.year);
	});
	test("Nonexistent year album", async () => {
		await galleryJestHelper.expectAlbumToNotBeInApi("/1899");
	});

	test("Nonexistent week album", async () => {
		await galleryJestHelper.expectAlbumToNotBeInApi("/1899/02-01");
	});

	test("Year album exists", async () => {
		if (!fix) throw "No fix!";
		await galleryJestHelper.expectAlbumToBeInApi(fix.getYearPath());
	});

	test("Week album exists", async () => {
		if (!fix) throw "No fix!";
		await galleryJestHelper.expectAlbumToBeInApi(fix.getWeekPath());
	});
});
