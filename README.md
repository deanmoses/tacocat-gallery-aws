# Tacocat Gallery AWS Image Recognition and Image Processing Backend

Uses [AWS Step Functions](https://aws.amazon.com/step-functions/) to orchestrate a serverless processing workflow using [AWS Lambda](http://aws.amazon.com/lambda/), [Amazon S3](http://aws.amazon.com/s3/), [Amazon DynamoDB](http://aws.amazon.com/dynamodb/) and [Amazon Rekognition](https://aws.amazon.com/rekognition/). This workflow processes photos uploaded to Amazon S3 and extracts metadata from the image such as geolocation, size/format, time, etc. It then uses image recognition to tag objects in the photo. In parallel, it also produces a thumbnail of the photo.

### Install prerequisites

1. [Git](http://git-scm.com/) - _source control tool. Needed to retrieve this project from github.com_
1. [Node.js](http://nodejs.org/) - _Node.js server. Needed to manage development tools_
1. [AWS CLI](https://aws.amazon.com/cli/) - _Amazon Web Service Command Line Interface.  Needed to deploy project to AWS_

### Install project

1. `cd` to directory under which you want to create project
1. Get this project via `git clone [url to this project]`
1. `cd` into project
1. Install the project's npm dependencies: `npm install` _(must be in project root dir)_
1. Create directory into which the build assets are created: `mkdir cloudformation/dist` _(must be in project root dir)_

## Deploy project to AWS

1. `npm run deploy` - Deploys project to AWS _(must be in project root dir)_

Before running this you must:
 - Deploy to a region that supports **Amazon Rekognition** and **AWS Step Functions**, e.g. US East (N. Virginia) or EU (Ireland).  One way to do this is run `aws configure` to set your default region.
 - Have a S3 bucket in the target region into which the assets will be deployed

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
