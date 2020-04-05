# Tacocat Gallery AWS Image Recognition and Image Processing Backend

Uses [AWS Step Functions](https://aws.amazon.com/step-functions/) to orchestrate a serverless processing workflow using [AWS Lambda](http://aws.amazon.com/lambda/), [Amazon S3](http://aws.amazon.com/s3/), [Amazon DynamoDB](http://aws.amazon.com/dynamodb/) and [Amazon Rekognition](https://aws.amazon.com/rekognition/). This workflow processes photos uploaded to Amazon S3 and extracts metadata from the image such as geolocation, size/format, time, etc. It then uses image recognition to tag objects in the photo. In parallel, it also produces a thumbnail of the photo.

### Install prerequisites

- [Git](http://git-scm.com/) - source control tool. _Needed to retrieve this project from github.com._
- [Node.js](http://nodejs.org/) - Javascript server. _Needed to manage development tools._
- [Lerna](https://lerna.js.org/) - Javascript package manager. _Needed to manage multiple Javascript packages within a single Git repo._
- [AWS CLI](https://aws.amazon.com/cli/) - Amazon Web Service's Command Line Interface.  _Needed to deploy project to AWS._

### Install project

1. `cd` to directory under which you want to create project
1. Get this project via `git clone [url to this project]`
1. `cd` into project
1. Install the project's npm dependencies: `npm install` _(must be in project root dir)_
1. Install the project's javascript packages: `lerna bootstrap` _(must be in project root dir)_
1. Create directory into which the build assets are created: `mkdir cloudformation/dist` _(must be in project root dir)_

### Test project
Run local tests: `npm test` _(must be in project root dir)_

### Configure deployment of project
In order to deploy project to AWS, you must:
 - Deploy to a region that supports **Amazon Rekognition** and **AWS Step Functions**, e.g. US East (N. Virginia) or EU (Ireland).  One way to do this is run `aws configure` to set your default region for AWS CLI commands.
 - Have a **S3 bucket** in the target region into which the assets will be deployed.  The bucket name is configured in `cloudformation/deploy_stack.sh`
 
### Deploy project
Deploy project to AWS: `npm run deploy` _(must be in project root dir)_
