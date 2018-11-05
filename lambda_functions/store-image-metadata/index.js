// dependencies
const AWS = require('aws-sdk');
const util = require('util');

const tableName = process.env.IMAGE_METADATA_DDB_TABLE;
// get reference to S3 client
const s3 = new AWS.S3();
const docClient = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION
});

/**
 * A Lambda function that creates/updates the image in DynamoDB.
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
    const s3ObjectMetadataPromise = s3.headObject(s3ObjectParams).promise();
    s3ObjectMetadataPromise.then((s3ObjectMetadata) => {
        // the s3 key starts with "albums/".  Remove that.
        const imageID = event.s3Key.substring(event.s3Key.indexOf("/") + 1);
        // albumID will be something like albumName/subalbumName
        var albumID =  srcKey; // srcKey is something like albums/albumName/subalbumName/image.jpg
        albumID = albumID.substring(albumID.indexOf("/") + 1);  // strip "albums/"
        albumID = albumID.substring(0, albumID.lastIndexOf("/")); // strip "/image.jpg"

        //
        // Create the item if it has not already been created
        //
        const dynamoItem = {
            imageID: imageID,
            s3key: event.s3Key,
            albumID: albumID,
            userID: "moses"
        };
        const initialItemPutPromise = docClient.put({
            TableName: tableName,
            Item: dynamoItem,
            ConditionExpression: 'attribute_not_exists (imageID)'
        }).promise();
        initialItemPutPromise.then(data => {
            updateImage(srcKey, imageID, s3ObjectMetadata);
        });
    });
};

/**
 * Update the previously created image.
 * 
 * This update will happen every time a new version of the item is 
 * uploaded to the bucket.
 */
function updateImage(event, srcKey, imageID, s3ObjectMetadata) {
        const fileUploadTimeStamp = Math.floor(Date.parse(s3ObjectMetadata.LastModified) / 1000);
        console.log(util.inspect(s3ObjectMetadata, {depth: 5}));
 
        var UpdateExpression = 'SET uploadTime = :uploadTime, ' +
            'imageFormat = :format, dimensions = :dimensions, ' +
            'fileSize = :fileSize ';

        var ExpressionAttributeValues = {
            ":uploadTime": fileUploadTimeStamp,
            ":format": event.extractedMetadata.format,
            ":dimensions": event.extractedMetadata.dimensions,
            ":fileSize": event.extractedMetadata.fileSize
        };

        if (event.extractedMetadata.geo) {
            UpdateExpression += ", latitude = :latitude";
            ExpressionAttributeValues[":latitude"] = event.extractedMetadata.geo.latitude;
            UpdateExpression += ", longitude = :longitude";
            ExpressionAttributeValues[":longitude"] = event.extractedMetadata.geo.longitude;
        }

        if (event.extractedMetadata.exifMake) {
            UpdateExpression += ", exifMake = :exifMake";
            ExpressionAttributeValues[":exifMake"] = event.extractedMetadata.exifMake;
        }
        if (event.extractedMetadata.exifModel) {
            UpdateExpression += ", exifModel = :exifModel";
            ExpressionAttributeValues[":exifModel"] = event.extractedMetadata.exifModel;
        }

        if (event.parallelResults[0]) {
            const labels = event.parallelResults[0];
            var tags = labels.map((data) => {
                return data["Name"];
            });
            UpdateExpression += ", tags = :tags";
            ExpressionAttributeValues[":tags"] = tags;
        }

        if (event.parallelResults[1]) {
            UpdateExpression += ", thumbnail = :thumbnail";
            ExpressionAttributeValues[":thumbnail"] = event.parallelResults[1];
        }

        console.log("UpdateExpression", UpdateExpression);
        console.log("ExpressionAttributeValues", ExpressionAttributeValues);

        var ddbparams = {
            TableName: tableName,
            Key: {
                'imageID': imageID
            },
            UpdateExpression: UpdateExpression,
            ExpressionAttributeValues: ExpressionAttributeValues,
            ConditionExpression: 'attribute_exists (imageID)'
        };

        docClient.update(ddbparams).promise().then(function (data) {
            callback(null, data);
        }).catch(function (err) {
            callback(err);
        });
}