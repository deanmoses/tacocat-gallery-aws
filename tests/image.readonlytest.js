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
const JestUtils = require("./utils/JestUtils.js");
const FixtureHelper = require("./utils/FixtureHelper.js");
const fixture = require("./utils/fixture_data.js");

// beforeAll will set these
let stack, galleryApi, fix;

/**
 * RETREIVE IMAGES VIA API
 */
describe("Retrieve images via API", async () => {
	/**
	 * Get information about the CloudFormation stack
	 */
	beforeAll(async () => {
		stack = await getStackConfiguration();
		galleryApi = new GalleryApi(stack);
		fix = new FixtureHelper(fixture);
	});
	test("Image exists: ", async () => {
		const image = await galleryApi.fetchImage(fix.getImagePath());
		JestUtils.expectValidImage(image);

		// Is there a title?
		expect(image.title).toBeDefined();
		expect(typeof image.title).toBe("string");
		expect(image.title.length).toBeGreaterThan(0);
	});
});
