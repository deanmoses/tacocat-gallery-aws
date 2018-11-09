/**
 * Given a S3 key, return the album ID
 *
 * @param {*} s3key Amazon S3 key of object, needs to be something like albums/albumName/subalbumName/
 */
function getAlbumPathFromS3key(s3key) {
	// S3 key may have spaces or unicode non-ASCII characters
	var albumId = decodeURIComponent(s3key.replace(/\+/g, " "));
	albumId = albumId.substring(albumId.indexOf("/") + 1); // strip "albums/"
	albumId = albumId.substring(0, albumId.lastIndexOf("/")); // strip last "/"
	// final albumID will be something like albumName/subalbumName
	return albumId;
}

module.exports = getAlbumPathFromS3key;
