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
 * UPDATE IMAGES VIA API
 */
describe("Update images via API", async () => {
	/**
	 * Get information about the CloudFormation stack
	 */
	beforeAll(async () => {
		stack = await getStackConfiguration();
		galleryApiJestHelper = new GalleryApiJestHelper(stack);
		api = new GalleryApi(stack);
		fix = new FixtureHelper(fixture);
	});

	test("Nonexistent image", async () => {
		await galleryApiJestHelper.expectUpdateImageNotFound(
			"/1899/01-31/image.jpg",
			{
				title: "foo"
			}
		);
	});

	test("Existing image", async () => {
		const imagePath = fix.getImagePath();

		// Un-set title and description
		await galleryApiJestHelper.expectUpdateImageSuccess(imagePath, {
			title: "",
			description: ""
		});

		// Image should not have title or description
		let image = await api.fetchImage(imagePath);
		JestUtils.expectValidImage(image);
		expect(image.title).toBeUndefined();
		expect(image.description).toBeUndefined();

		// Update title and description
		const newTitle = "Title " + JestUtils.generateRandomInt();
		const newDescription = "Description " + JestUtils.generateRandomInt();
		await galleryApiJestHelper.expectUpdateImageSuccess(imagePath, {
			title: newTitle,
			description: newDescription
		});

		// Image title should be the new one
		image = await api.fetchImage(imagePath);
		JestUtils.expectValidImage(image);
		expect(image.title).toBe(newTitle);
		expect(image.description).toBe(newDescription);
	});
});
