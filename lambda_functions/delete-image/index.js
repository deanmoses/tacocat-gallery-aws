// dependencies
const AWS = require('aws-sdk');

const tableName = process.env.IMAGE_DDB_TABLE;
const docClient = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION
});

/**
 * A Lambda function that deletes image in DynamoDB.
 */
exports.handler = (event, context, callback) => {
    // The s3 srcKey may have spaces or unicode non-ASCII characters
    const srcKey = decodeURIComponent(event.s3Key.replace(/\+/g, " "));

    // The s3 srcKey starts with "albums/".  Remove that.
    const imageID = srcKey.substring(srcKey.indexOf("/") + 1);

    deleteImage(imageID).then(data => {
        callback(null, data);
    }).catch(err => {
        callback(err);
    });
};

/**
 * Delete the album from DynamoDB
 */
function deleteImage(imageID) {
    return new Promise(function(resolve, reject) {
        const ddbparams = {
            TableName: tableName,
            Key:{"imageID": imageID},
            ConditionExpression: 'attribute_exists (imageID)'
        };
        docClient.delete(ddbparams).promise().then(data => {
            resolve(data);
        }).catch(err => {
            reject(err);
        });
    });
}