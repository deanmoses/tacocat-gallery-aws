// dependencies
const AWS = require('aws-sdk');
const util = require('util');

const tableName = process.env.ALBUM_METADATA_DDB_TABLE;
// get reference to S3 client
const s3 = new AWS.S3();
const docClient = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION
});

/**
 * A Lambda function that creates the album in DynamoDB.
 */
exports.handler = (event, context, callback) => {
    console.log("Reading input from event:\n", util.inspect(event, {depth: 5}));
    const srcBucket = event.s3Bucket;
    // Object key may have spaces or unicode non-ASCII characters.
    const srcKey = decodeURIComponent(event.s3Key.replace(/\+/g, " "));
    const s3ObjectParams = {
        Bucket: srcBucket,
        Key: srcKey
    };
    s3.headObject(s3ObjectParams).promise().then((s3ObjectMetadata) => {
        createAlbum(srcKey, s3ObjectMetadata).then(data => {
            callback(null, data);
        }).catch(err => {
            callback(err);
        });
    });
};

/**
 * Create the album in DynamoDB
 */
function createAlbum(srcKey, s3ObjectMetadata) {
    return new Promise(function(resolve, reject) {
        // albumID will be something like albumName/subalbumName
        var albumID =  srcKey; // srcKey is something like albums/albumName/subalbumName/
        albumID = albumID.substring(albumID.indexOf("/") + 1);  // strip "albums/"
        albumID = albumID.substring(0, albumID.lastIndexOf("/")); // strip last "/"

        const fileUploadTimeStamp = Math.floor(Date.parse(s3ObjectMetadata.LastModified) / 1000);

        const dynamoAlbumItem = {
            albumID: albumID,
            uploadTimeStamp: fileUploadTimeStamp,
            userID: "moses"
        };
        const ddbparams = {
            TableName: tableName,
            Item: dynamoAlbumItem,
            ConditionExpression: 'attribute_not_exists (albumID)'
        };
        docClient.put(ddbparams).promise().then(data => {
            resolve(data);
        }).catch(err => {
            reject(err);
        });
    });
}