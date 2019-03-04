/**
 * Exception that instructs the lambda function to return a 400
 *
 * @param {String} message error message
 */
function BadRequestException(message) {
	this.httpStatusCode = 400;
	this.message = message;
	// Use V8's native method if available, otherwise fallback
	if ("captureStackTrace" in Error) {
		Error.captureStackTrace(this, BadRequestException);
	} else {
		this.stack = new Error().stack;
	}
}

BadRequestException.prototype = Object.create(Error.prototype);
BadRequestException.prototype.name = "BadRequestException";
BadRequestException.prototype.constructor = BadRequestException;

module.exports = BadRequestException;
