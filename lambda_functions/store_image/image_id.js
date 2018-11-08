/**
 * Given a S3 key, return the image ID
 *
 * @param {*} s3key Amazon S3 key of object, needs to be something like albums/albumName/subalbumName/someImage.jpg
 */
function getImageId(s3key) {
    // S3 key may have spaces or unicode non-ASCII characters
    var imageId = decodeURIComponent(s3key.replace(/\+/g, " "));
    // the s3 key starts with "albums/".  Remove that.
    imageId = imageId.substring(imageId.indexOf("/") + 1);
    // final imageId will be something like albumName/subalbumName/someImage.jpg
    return imageId;
}

module.exports = getImageId;