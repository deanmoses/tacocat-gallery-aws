const AWS = require("./configure_aws.js");
const cloudformation = new AWS.CloudFormation();

/**
 * Return information like the S3 bucket names about the deployed stack
 */
async function getStackConfiguration() {
	const describeStacks = await cloudformation
		.describeStacks({ StackName: "TacocatGallery" })
		.promise();

	if (!describeStacks) throw "describeStacks not defined";
	if (!describeStacks.Stacks) throw "describeStacks.Stacks not defined";
	if (!describeStacks.Stacks.length) throw "describeStacks not an array";
	if (!describeStacks.Stacks.length > 0) throw "describeStacks is empty";

	const s = describeStacks.Stacks[0];

	const stackInfo = {
		accessKey: getOutputValue(s, "TestUserAccessKey"),
		secretKey: getOutputValue(s, "TestUserSecretKey"),
		originalImageBucketName: getOutputValue(s, "S3PhotoRepoBucket"),
		derivedImageBucketName: getOutputValue(s, "DerivedImageS3Bucket"),
		cloudFrontUrl: getOutputValue(s, "CloudFrontUrl"),
		apiUrl: getOutputValue(s, "ApiUrl"),
		originalImagePrefix: getOutputValue(s, "OriginalImagePrefix"),
		thumbnailImagePrefix: getOutputValue(s, "ThumbnailImagePrefix"),
		largeImagePrefix: getOutputValue(s, "LargeImagePrefix"),
		stateMachineArn: getOutputValue(s, "StateMachineArn")
	};

	return stackInfo;
}

module.exports = getStackConfiguration;

/**
 * Return the value of the specified stack output
 * @param {*} stack
 * @param {*} outputKey
 */
function getOutputValue(stack, outputKey) {
	const found = stack.Outputs.find(function(element) {
		return element.OutputKey.indexOf(outputKey) >= 0;
	});
	if (!found) throw "Did not find output with key of: " + outputKey;
	return found.OutputValue;
}
