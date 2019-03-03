const PathUtils = require("./PathUtils.js");

//
// SCHEMAS
// Schemas for validating gallery albums and images
// These are JSON schema:  http://json-schema.org/
//

const yearAlbumNameSchema = {
	$schema: "http://json-schema.org/schema#",
	title: "Year Album Name",
	description: "Year album name like 2001",
	type: "string",
	pattern: PathUtils.getYearAlbumNameRegexString()
};
module.exports.yearAlbumNameSchema = yearAlbumNameSchema;

const weekAlbumNameSchema = {
	$schema: "http://json-schema.org/schema#",
	title: "Week Album Name",
	description: "Week album name like 12-31",
	type: "string",
	pattern: PathUtils.getWeekAlbumNameRegexString()
};
module.exports.weekAlbumNameSchema = weekAlbumNameSchema;

const albumNameSchema = {
	$schema: "http://json-schema.org/schema#",
	title: "Album Name",
	description: "Album name like 2001 or 12-31",
	type: "string",
	oneOf: [yearAlbumNameSchema, weekAlbumNameSchema]
};
module.exports.albumNameSchema = albumNameSchema;

const imageNameSchema = {
	$schema: "http://json-schema.org/schema#",
	title: "Image Name",
	description: "Image name like image.jpg",
	type: "string",
	pattern: PathUtils.getImageNameRegexString()
};
module.exports.imageNameSchema = imageNameSchema;

const rootPathSchema = {
	$schema: "http://json-schema.org/schema#",
	title: "Root Path",
	description: "Root path, which is /",
	type: "string",
	pattern: PathUtils.getRootAlbumPathRegexString()
};
module.exports.rootPathSchema = rootPathSchema;

const yearAlbumPathSchema = {
	$schema: "http://json-schema.org/schema#",
	title: "Year Path",
	description: "Year album path like /2001/",
	type: "string",
	pattern: PathUtils.getYearAlbumPathRegexString()
};
module.exports.yearAlbumPathSchema = yearAlbumPathSchema;

const weekAlbumPathSchema = {
	$schema: "http://json-schema.org/schema#",
	title: "Week Path",
	description: "Week path like /2001/12-31/",
	type: "string",
	pattern: PathUtils.getWeekAlbumPathRegexString()
};
module.exports.weekAlbumPathSchema = weekAlbumPathSchema;

const albumParentPathSchema = {
	$schema: "http://json-schema.org/schema#",
	title: "Album Parent Path",
	description: "Parent path of a year or week album, meaning / or /2001/",
	type: "string",
	oneOf: [rootPathSchema, yearAlbumPathSchema]
};
module.exports.albumParentPathSchema = albumParentPathSchema;

const tagsSchema = {
	$schema: "http://json-schema.org/schema#",
	title: "Tags",
	description: "Array of tags like [trip, zoo, cousins]",
	type: "array",
	minItems: 1,
	items: {
		type: "string"
	}
};
module.exports.tagsSchema = tagsSchema;

const prevNextAlbumSchema = {
	$schema: "http://json-schema.org/schema#",
	title: "Prev / Next Album",
	description: "Prev and next album",
	type: "object",
	required: ["itemName", "parentPath", "updatedOn"],
	additionalProperties: false /* don't allow unknown properties */,
	properties: {
		itemName: albumNameSchema,
		parentPath: albumParentPathSchema,
		title: { type: "string" },
		updatedOn: { type: "string", format: "date-time" }
	}
};
module.exports.prevNextAlbumSchema = prevNextAlbumSchema;

const dimensionsSchema = {
	$schema: "http://json-schema.org/schema#",
	title: "Dimensions",
	description: "Dimensions of an image (width and height)",
	type: "object",
	required: ["height", "width"],
	additionalProperties: false /* don't allow unknown properties */,
	properties: {
		width: { type: "integer", minimum: 1 },
		height: { type: "integer", minimum: 1 }
	}
};
module.exports.dimensionsSchema = dimensionsSchema;

const imageThumbnailSchema = {
	$schema: "http://json-schema.org/schema#",
	title: "Image Thumbnail",
	description: "Thumbnail on an image",
	type: "object",
	required: ["x", "y", "length", "fileUpdatedOn"],
	additionalProperties: false /* don't allow unknown properties */,
	properties: {
		x: { type: "integer", minimum: 0 },
		y: { type: "integer", minimum: 0 },
		length: { type: "integer", minimum: 1 },
		fileUpdatedOn: { type: "string", format: "date-time" }
	}
};
module.exports.imageThumbnailSchema = imageThumbnailSchema;

const imageSchema = {
	$schema: "http://json-schema.org/schema#",
	title: "Image",
	description: "Image object",
	type: "object",
	required: ["itemName", "parentPath", "updatedOn", "itemType"],
	additionalProperties: false /* don't allow unknown properties */,
	properties: {
		itemName: imageNameSchema,
		parentPath: weekAlbumPathSchema,
		updatedOn: { type: "string", format: "date-time" },
		createdOn: { type: "string", format: "date-time" },
		title: { type: "string" },
		description: { type: "string" },
		tags: tagsSchema,
		dimensions: dimensionsSchema,
		itemType: { type: "string", pattern: "media" },
		thumbnail: imageThumbnailSchema
	}
};
module.exports.imageSchema = imageSchema;

const albumSchema = {
	$schema: "http://json-schema.org/schema#",
	title: "Album",
	description: "Albums other than the root gallery",
	type: "object",
	required: ["itemName", "parentPath", "updatedOn", "itemType"],
	additionalProperties: false /* don't allow unknown properties */,
	properties: {
		itemName: albumNameSchema,
		parentPath: albumParentPathSchema,
		updatedOn: { type: "string", format: "date-time" },
		createdOn: { type: "string", format: "date-time" },
		itemType: { type: "string", pattern: "album" },
		title: { type: "string" },
		description: { type: "string" },
		tags: tagsSchema
	}
};
module.exports.albumSchema = albumSchema;

const albumResponseSchema = {
	$schema: "http://json-schema.org/schema#",
	type: "object",
	required: ["album"],
	additionalProperties: false /* don't allow unknown properties */,
	properties: {
		album: albumSchema,
		prevAlbum: prevNextAlbumSchema,
		nextAlbum: prevNextAlbumSchema,
		children: {
			type: "array",
			minItems: 1,
			items: albumSchema
		}
	}
};
module.exports.albumResponseSchema = albumResponseSchema;
