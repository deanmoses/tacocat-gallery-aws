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
const JestUtils = require("./utils/JestUtils.js");
const GalleryApi = require("./utils/GalleryApi.js");

// beforeAll will set these
let stack, galleryApi;

/**
 * RETREIVE LATEST ALBUM VIA API
 */
describe("Retrieve latest album via API", async () => {
	/**
	 * Get information about the CloudFormation stack
	 */
	beforeAll(async () => {
		stack = await getStackConfiguration();
		galleryApi = new GalleryApi(stack);
	});
	test("Retrieve latest album", async () => {
		const albumResponse = await galleryApi.fetchLatestAlbum();
		const album = albumResponse.album;
		expect(album).toBeDefined();

		// Is album itemName a valid week album like "12-31"?
		JestUtils.expectValidWeekItemName(album.itemName);

		// Is album parentPath a valid year album like "/2001/"?
		JestUtils.expectValidYearPath(album.parentPath);

		// Is date the expected format?
		JestUtils.expectValidDate(album.updateDateTime);
	});
});
