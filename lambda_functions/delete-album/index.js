// dependencies
const AWS = require('aws-sdk');

const tableName = process.env.ALBUM_DDB_TABLE;
const docClient = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION
});

/**
 * A Lambda function that deletes album in DynamoDB.
 */
exports.handler = (event, context, callback) => {
    // The s3 srcKey may have spaces or unicode non-ASCII characters
    const srcKey = decodeURIComponent(event.s3Key.replace(/\+/g, " "));

    // albumID will be something like albumName/subalbumName
    var albumID =  srcKey; // The s3 srcKey is something like albums/albumName/subalbumName/
    albumID = albumID.substring(albumID.indexOf("/") + 1);  // strip "albums/"
    albumID = albumID.substring(0, albumID.lastIndexOf("/")); // strip last "/"

    deleteAlbum(albumID).then(data => {
        callback(null, data);
    }).catch(err => {
        callback(err);
    });
};

/**
 * Delete the album from DynamoDB
 */
function deleteAlbum(albumID) {
    return new Promise(function(resolve, reject) {
        const ddbparams = {
            TableName: tableName,
            Key:{"albumID": albumID},
            ConditionExpression: 'attribute_exists (albumID)'
        };
        docClient.delete(ddbparams).promise().then(data => {
            resolve(data);
        }).catch(err => {
            reject(err);
        });
    });
}