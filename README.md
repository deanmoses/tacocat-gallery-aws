# Tacocat Gallery AWS Image Recognition and Image Processing Backend

Uses [AWS Step Functions](https://aws.amazon.com/step-functions/) to orchestrate a serverless processing workflow using [AWS Lambda](http://aws.amazon.com/lambda/), [Amazon S3](http://aws.amazon.com/s3/), [Amazon DynamoDB](http://aws.amazon.com/dynamodb/) and [Amazon Rekognition](https://aws.amazon.com/rekognition/). This workflow processes photos uploaded to Amazon S3 and extracts metadata from the image such as geolocation, size/format, time, etc. It then uses image recognition to tag objects in the photo. In parallel, it also produces a thumbnail of the photo.


## Deploying

You must deploy to a region that supports **Amazon Rekognition** and **AWS Step Functions**, e.g. US East (N.Virginia) or EU (Ireland), you need a S3 bucket in the target region, and then package the Lambda functions into that S3 bucket by using the `aws cloudformation package` utility.

First, In the terminal,  go to the `lambda-functions` folder. Then prepare npm dependencies for the following Lambda functions:

```bash
cd lambda-functions
cd create-s3-event-trigger-helper && npm install && cd ../thumbnail  && npm install && cd ../extract-image-metadata && npm install && cd ..
```

Set environment variables for later commands to use:

```bash
REGION=[YOUR_TARGET_REGION]
S3BUCKET=[REPLACE_WITH_YOUR_BUCKET]
```

Then go to the `cloudformation` folder and use the `aws cloudformation package` utility

```bash
cd ../cloudformation

python inject_state_machine_cfn.py -s state-machine.json -c image-processing.serverless.yaml -o image-processing.complete.yaml

aws cloudformation package --region $REGION --s3-bucket $S3BUCKET --template image-processing.complete.yaml --output-template-file image-processing.output.yaml
```
Last, deploy the stack with the resulting yaml (`image-processing.output.yaml `) through the CloudFormation Console or command line:

```bash
aws cloudformation deploy --region $REGION --template-file image-processing.output.yaml --stack-name photo-sharing-backend --capabilities CAPABILITY_IAM
```

## Cleaning Up the Application Resources

To remove all resources created by this example, do the following:

1. Delete all objects from the S3 bucket created by the CloudFormation stack.
1. Delete the CloudFormation stack.
1. Delete the CloudWatch log groups associated with each Lambda function created by the CloudFormation stack.

### IAM roles
> This CloudFormation template chose not to create one IAM role for each Lambda function and consolidated them, simply to reduce the number of IAM roles it takes up in your account. When developing your application, you might instead create individual IAM roles for each Lambda function to follow the Least Privilege principle. 

- **BackendProcessingLambdaRole** - An IAM role assumed by Lambda functions that make up the `ImageProcStateMachine` and the `ExecuteStepFunctionsFunction` which kicks off the state machine execution. This role provides logging permissions and access to read/write the `PhotoRepoS3Bucket`, the `ImageMetadataDDBTable`, call the `DetectLabels` Amazon Rekognition API and start state machine execution in Step Functions. 
- **CustomResourceHelperRole** -  An IAM role the Lambda functions that are used by  `CreateS3EventTriggerFunction` for creating custom resources in the CloudFormation template
- **StateMachineRole** - An IAM role assumed by the `ImageProcStateMachine` during execution. It has permission to invoke Lambda functions. 
- **DescribeExecutionFunctionRole**  - An IAM role assumed by `DescribeExecutionFunction`. It has permission to `DescribeExecution` API in Step Functions.
- **TestClientIAMRole** - An IAM role assumed by the `TestClientIdentityPool` Cognito Identity pool