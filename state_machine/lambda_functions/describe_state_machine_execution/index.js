const AWS = require("aws-sdk");
const stepfunctions = new AWS.StepFunctions({
	region: process.env.AWS_REGION
});

/**
 * Lambda function to be used by web apps to query status of a Step Function
 * state machine execution.
 *
 * This Lambda function is necessary because the Step Functions API does not
 * support CORS as of Aug 2018; thus this Lambda function is used to proxy
 * calls to Step Functions.
 */
exports.handler = async event => {
	return await stepfunctions
		.describeExecution({
			executionArn: event.executionArn
		})
		.promise();
};
