//
// Execute this file in Node.js to create the fixture data in S3
//
// Skips any asset that already exists, so it won't overwrite any existing data or incur unnecessary StepFunctions usage
//

const getStackConfiguration = require("./get_stack_configuration.js");
const GalleryS3 = require("./GalleryS3.js");
const fixture = require("./fixture_data.js");
const PathUtils = require("./PathUtils.js");
const path = require("path");

const imagePathOnDisk = path.join(
	path.dirname(__dirname),
	"test_data",
	"test_image_1.jpg"
);

let stack, galleryS3;
async function createFixtureData() {
	stack = await getStackConfiguration();
	galleryS3 = new GalleryS3(stack);

	// For prev / current / next YEAR
	for (const prevCurNextYear in fixture) {
		const year = fixture[prevCurNextYear].year;
		const yearPath = PathUtils.getYearPath(year);

		/* eslint-disable no-console */
		if (!(await galleryS3.albumExists(yearPath))) {
			console.log("Creating year: " + yearPath);
			await galleryS3.createAlbum(yearPath);
		}

		// For prev / current / next WEEK
		for (const prevCurNextWeek in fixture) {
			const week = fixture[prevCurNextWeek].week;
			const weekPath = PathUtils.getWeekPath(year, week);

			if (!(await galleryS3.albumExists(weekPath))) {
				console.log("Creating week: " + weekPath);
				await galleryS3.createAlbum(weekPath);
			}

			// For prev / current / next IMAGE
			for (const prevCurNextImage in fixture) {
				const image = fixture[prevCurNextImage].image;
				const imagePath = PathUtils.getImagePath(year, week, image);
				if (!(await galleryS3.imageExists(imagePath))) {
					console.log("Uploading image: " + imagePath);
					await galleryS3.uploadImage(imagePathOnDisk, imagePath);
				}
			}
		}
		/* eslint-enable no-console */
	}
}

createFixtureData();
