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

// beforeAll will set these
let stack, galleryJestHelper;

/**
 * This is run before any of the tests run
 */
beforeAll(async () => {
	stack = await getStackConfiguration();
	galleryJestHelper = new GalleryJestHelper(stack);
});

/**
 * RETRIEVE ROOT ALBUM VIA API
 */
describe.skip("Root album", async () => {
	test("Retrieve root album", async () => {
		await galleryJestHelper.expectAlbumToBeInApi("");
	});
});
