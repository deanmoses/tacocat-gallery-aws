const AWS = require('aws-sdk');
const stepfunctions = new AWS.StepFunctions();
const util = require('util');
const stateMachineArn = process.env.STATE_MACHINE_ARN;

/**
 * A Lambda function that kicks off the image processing state machine every
 * time a new object is uploaded into the S3 bucket under the "albums/" prefix.
 */
exports.handler = (event, context, callback) => {
    const requestId = context.awsRequestId;

    console.log("Reading input from event:\n", util.inspect(event, {depth: 5}));
    const srcBucket = event.Records[0].s3.bucket.name;
    const s3key = event.Records[0].s3.object.key;

    // the s3 key starts with "albums/".  Remove that.
    const objectID = s3key.substring(s3key.indexOf("/") + 1);

    // if the s3 key ends in a "/", it's a prefix (aka an album), not an image or other file
    const isAlbum = s3key.endsWith("/");

    const input = {
        s3Bucket: srcBucket,
        s3Key: s3key,
        objectID: objectID,
        isAlbum: isAlbum
    };

    const stateMachineExecutionParams = {
        stateMachineArn: stateMachineArn,
        input: JSON.stringify(input),
        name: requestId
    };

    new Promise((resolve, reject) => {
        stepfunctions.startExecution(stateMachineExecutionParams)
            .promise()
            .then(function (data) {
                resolve(data.executionArn);
            })
            .catch(function (err) {
                reject(err);
            });
    });
};