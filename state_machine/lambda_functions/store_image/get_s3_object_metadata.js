/**
 * Retrieve the metadata of the specified S3 object
 *
 * @param {*} s3 The S3 client
 * @param {*} s3Bucket S3 bucket name
 * @param {*} s3Key S3 key of the object whose metadata you want
 */
function getS3ObjectMetadata(s3, s3Bucket, s3Key) {
    const s3ObjectParams = {
        Bucket: s3Bucket,
        Key: s3Key
    };
    return s3.headObject(s3ObjectParams).promise();
}

module.exports = getS3ObjectMetadata;