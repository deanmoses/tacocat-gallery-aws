const transformImageMetadata = require("./transform_image_metadata.js");

const original = require("./lambda-sample-input.json");
const expected = require("./lambda-sample-output.json");

// Convert fs.readFile into Promise for use with async / await
//const readFile = util.promisify(fs.readFile);
test("Transform Image Metadata", async () => {
	const result = transformImageMetadata(original);
	expect(result).toEqual(expected);
});
