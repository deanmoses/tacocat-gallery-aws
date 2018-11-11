const response = require('cfn-response');
const AWS = require('aws-sdk');
const util = require('util');
// get reference to S3 client
const s3 = new AWS.S3({
    region: process.env.AWS_REGION
});
const lambda = new AWS.Lambda({
    region: process.env.AWS_REGION
});

/**
 * A Lambda function that defines the S3 event notification trigger to the
 * first actual Lambda.
 * 
 * This Lambda is necessary because we can't use the native CloudFormation 
 * support for defining S3 event notification triggers to Lambda: that would  
 * result in a circular dependency, given how the resources are wired together
 * in our CloudFormation template.
 */
exports.handler = function (event, context) {
    console.log("Reading input from event:\n", util.inspect(event, {depth: 5}));
    const input = event.ResourceProperties;

    if (event.RequestType === 'Delete') {
        // deleting a notification configuration on S3 is achieved by putting an empty configuration
        var params = {
            Bucket: input.PhotoRepoS3Bucket,
            NotificationConfiguration: {}
        };

        s3.putBucketNotificationConfiguration(params).promise().then(data => {
            response.send(event, context, response.SUCCESS, data);
        }).catch(err => {
            console.log(err);
            response.send(event, context, response.FAILED, err);
        });
        return;
    }

    // set resource policy on the Lambda function to allow the S3 bucket to invoke it.
    const addPermissionPromise = new Promise((resolve, reject) => {
        const lambdaAddPermisionParams = {
            Action: "lambda:InvokeFunction",
            FunctionName: input.StartExecutionFunction,
            Principal: "s3.amazonaws.com",
            SourceAccount: input.accountId,
            SourceArn: "arn:aws:s3:::" + input.PhotoRepoS3Bucket,
            StatementId: "photoRepoS3Bucket"
        };
        console.log("lambdaAddPermisionParams", lambdaAddPermisionParams);
        lambda.addPermission(lambdaAddPermisionParams).promise().then(data => {
            console.log("successfully added lambda permission");
            resolve(data);
        }).catch(err => {
            reject(err);
        });
    });

    const s3NotificationParams = {
        Bucket: input.PhotoRepoS3Bucket,
        NotificationConfiguration: {
            LambdaFunctionConfigurations: [
                {
                    Events: ['s3:ObjectCreated:*','s3:ObjectRemoved:*'],
                    LambdaFunctionArn: input.StartExecutionFunctionArn,
                    Filter: {
                        Key: {
                            FilterRules: [
                                {
                                    Name: 'prefix',
                                    Value: 'albums/'
                                }
                            ]
                        }
                    },
                    Id: 'StartStepFunctionExecution'
                },
            ],
        }
    };

    addPermissionPromise.then(() => {
        console.log("s3NotificationParams", util.inspect(s3NotificationParams, {depth: 6}));
        s3.putBucketNotificationConfiguration(s3NotificationParams).promise().then(data => {
            response.send(event, context, response.SUCCESS, data);
        }).catch(err => {
            console.log(err);
            response.send(event, context, response.FAILED, err);
        })
    }).catch(err => {
        console.log(err);
        response.send(event, context, response.FAILED, err);
    });
};

