const NotFoundException = require("./NotFoundException.js");
const BadRequestException = require("./BadRequestException.js");
const respondHttp = require("./respondHttp.js");

/**
 * Turn the exception into a response of the format that
 * the AWS API Gateway will understand.
 *
 * @param {*} e an exception, possibly a HTTP exception
 * @returns {Object} something like the following format, as required by AWS API Gateway:
 * 		{
 * 			isBase64Encoded: false,
 *			statusCode: 400,
 *			body: JSON.stringify({ errorMessage: "Some error message" })
 * 		}
 */
async function handleHttpExceptions(e) {
	if (e instanceof BadRequestException) {
		return respondHttp({ errorMessage: e.message }, 400);
	} else if (e instanceof NotFoundException) {
		return respondHttp({ errorMessage: e.message }, 404);
	} else if (e.message) {
		return respondHttp({ errorMessage: e.message }, 500);
	} else {
		return respondHttp({ errorMessage: e }, 500); // TODO: handle case where e is not a string
	}
}
module.exports = handleHttpExceptions;
