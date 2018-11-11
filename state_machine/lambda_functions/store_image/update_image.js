/**
 * Update a previously created image in DynamoDB.
 * 
 * I expect this to be called  happen every time a new version of the item is 
 * uploaded to the bucket.
 * 
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} tableName Name of the Image table in DynamoDB
 * @param {*} imageId ID of the image to store in DynamoDB
 * @param {*} fileUploadTimeStamp time the image was uploaded to S3
 * @param {*} thumbnailS3key S3 key of the thumbnail version of the image
 * @param {*} metadata EXIF and IPTC metadata extracted from the image
 * @param {*} labels Image recognition labels
 */
function updateImage(docClient, tableName, imageId, fileUploadTimeStamp, thumbnailS3key, metadata, labels) {

    var UpdateExpression = 'SET uploadTime = :uploadTime, ' +
        'imageFormat = :format, dimensions = :dimensions, ' +
        'fileSize = :fileSize ';

    var ExpressionAttributeValues = {
        ":uploadTime": fileUploadTimeStamp,
        ":format": metadata.format,
        ":dimensions": metadata.dimensions,
        ":fileSize": metadata.fileSize
    };

    if (metadata.creationTime) {
        UpdateExpression += ", creationTime = :creationTime";
        ExpressionAttributeValues[":creationTime"] = metadata.creationTime;
    }

    if (metadata.description) {
        UpdateExpression += ", description = :description";
        ExpressionAttributeValues[":description"] = metadata.description;
    }

    if (metadata.title) {
        UpdateExpression += ", title = :title";
        ExpressionAttributeValues[":title"] = metadata.title;
    }

    if (metadata.tags) {
        UpdateExpression += ", tagz = :tagz";
        ExpressionAttributeValues[":tagz"] = metadata.tags;
    }

    if (metadata.geo) {
        UpdateExpression += ", latitude = :latitude";
        ExpressionAttributeValues[":latitude"] = metadata.geo.latitude;
        UpdateExpression += ", longitude = :longitude";
        ExpressionAttributeValues[":longitude"] = metadata.geo.longitude;
    }

    if (metadata.exifMake) {
        UpdateExpression += ", exifMake = :exifMake";
        ExpressionAttributeValues[":exifMake"] = metadata.exifMake;
    }
    if (metadata.exifModel) {
        UpdateExpression += ", exifModel = :exifModel";
        ExpressionAttributeValues[":exifModel"] = metadata.exifModel;
    }

    if (labels) {
        let tags = labels.map((data) => {
            return data["Name"];
        });
        UpdateExpression += ", tags = :tags";
        ExpressionAttributeValues[":tags"] = tags;
    }

    if (thumbnailS3key) {
        UpdateExpression += ", thumbnail = :thumbnail";
        ExpressionAttributeValues[":thumbnail"] = thumbnailS3key;
    }

    //console.log("UpdateExpression", UpdateExpression);
    //console.log("ExpressionAttributeValues", ExpressionAttributeValues);

    const ddbparams = {
        TableName: tableName,
        Key: {
            'imageID': imageId
        },
        UpdateExpression: UpdateExpression,
        ExpressionAttributeValues: ExpressionAttributeValues,
        ConditionExpression: 'attribute_exists (imageID)'
    };

    return docClient.update(ddbparams).promise();
}

module.exports = updateImage;