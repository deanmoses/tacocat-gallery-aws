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
 * RETREIVE IMAGES VIA API
 */
describe("Retrieve images via API", async () => {
	/**
	 * Get information about the CloudFormation stack
	 */
	beforeAll(async () => {
		stack = await getStackConfiguration();
		galleryJestHelper = new GalleryJestHelper(stack);
		galleryApi = new GalleryApi(stack);
	});
	test("Image exists: " + fixture.imagePath, async () => {
		const image = await galleryApi.fetchImage(
			fixture.weekAlbumPath,
			fixture.image
		);
		expect(image).toBeDefined();
		// Is date the expected format?
		expect(galleryJestHelper.isIso8601(image.updateDateTime)).toBeTruthy();
		expect(image.title).toBeDefined();
	});
});
