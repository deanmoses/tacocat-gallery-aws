const { setImageAsAlbumThumb, DynamoUpdateBuilder } = require("dynamo-utils");
const { getParentAndNameFromPath } = require("gallery-path-utils");

/**
 * Chooses a new thumbnail for one or more albums in DynamoDB
 *
 * This is designed to be called by the image processing Step Function after S3
 * deletes an image that was the thumbnail for one or more albums.  For each
 * album it was the thumbnail for, it finds a new image to be its thumbnail.
 *
 * @param {Object} event the Lambda event
 * @param {Object} ctx the environmental context needed to do the work
 */
async function chooseImageThumbnail(event, ctx) {
	if (!event) throw "Missing event";
	const albums = event.thumbForAlbums;
	if (!albums) throw "Missing event.thumbForAlbums";
	if (!Array.isArray(albums)) throw "event.thumbForAlbums is not an array";
	if (albums.length <= 0) throw "event.thumbForAlbums array is empty";

	// results to return to StepFunctions
	const results = {};

	// TODO: instead of looping through albums,
	// do one single album and pass the result
	// back to Step Functions.  Step Functions
	// will pipe it through the same choice
	// that detects whether it needs to call
	// this again, or quit.
	// End state:
	// {
	// 	  event.thumbForAlbums: [],
	// 	  albumCount: 0
	// }

	// for each album
	for (const albumPath of albums) {
		// get a single child image
		const image = await getChildImage(ctx, albumPath);

		// if album has no child images
		if (image === undefined) {
			await removeAlbumThumb(ctx, albumPath);
			results[albumPath] = "Removed thumb; album has no child images";
		}
		// else set the image as the album's thumb
		else {
			const imagePath = albumPath + image.itemName;
			const thumbnailUpdatedOn = image.thumbnail
				? image.thumbnail.fileUpdatedOn
				: image.fileUpdatedOn;
			const albumThumbWasUpdated = await setImageAsAlbumThumb(
				ctx,
				albumPath,
				imagePath,
				thumbnailUpdatedOn,
				true /* replaceExistingThumb */
			);

			// results are for debugging
			results[albumPath] = albumThumbWasUpdated
				? "Thumb was updated to " + imagePath
				: "Thumb wasn't updated; album already had thumb";
		}
	}

	// Return success to StepFunctions
	// This value is not used; it's just for debugging
	return results;
}
module.exports = chooseImageThumbnail;

/**
 * Remove thumbnail from album, leaving it without a thumbnail
 *
 * @param {Object} ctx the environmental context needed to do the work
 * @param {String} albumPath Path of the album to delete, like /2001/12-31/
 */
async function removeAlbumThumb(ctx, albumPath) {
	const bldr = new DynamoUpdateBuilder();
	bldr.add("updatedOn", new Date().toISOString());
	bldr.delete("thumbnail");

	const pathParts = getParentAndNameFromPath(albumPath);

	const dynamoParams = {
		TableName: ctx.tableName,
		Key: {
			parentPath: pathParts.parent,
			itemName: pathParts.name
		},
		UpdateExpression: bldr.getUpdateExpression(),
		ExpressionAttributeValues: bldr.getExpressionAttributeValues(),
		ConditionExpression: "attribute_exists (itemName)"
	};

	try {
		return await ctx.doRemoveAlbumThumb(dynamoParams);
	} catch (e) {
		// Conditional failure means album doesn't exist
		// That's not an error
		if (e.toString().indexOf("conditional") >= 0) {
			throw e;
		}
	}
}

/**
 * Get one of an album's immediate child images
 * Will not retrieve a child album
 * Will not retrieve a grandchild image
 *
 * @param {Object} ctx the environmental context needed to do the work
 * @param {*} albumPath Path of the album to retrieve, like /2001/12-31/
 */
async function getChildImage(ctx, albumPath) {
	const dynamoParams = {
		TableName: ctx.tableName,
		KeyConditionExpression: "parentPath = :parentPath",
		FilterExpression: "itemType = :itemType",
		ExpressionAttributeValues: {
			":parentPath": albumPath,
			":itemType": "media"
		},
		ProjectionExpression: "itemName,fileUpdatedOn,thumbnail",
		Limit: 1,
		// Because it’s likely that a lot of images are deleted at once in S3,
		// we don’t want a cached version of the children; instead, we want a
		// strongly consistent read.
		ConsistentRead: true
	};

	const results = await ctx.queryChildImage(dynamoParams);
	return results.Items[0];
}
