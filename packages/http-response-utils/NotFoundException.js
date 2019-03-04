/**
 * Exception that instructs the lambda function to return a 404
 * 
 * @param {String} message error message
 */
function NotFoundException(message) {
	this.httpStatusCode = 404;
	this.message = message;
	// Use V8's native method if available, otherwise fallback
	if ("captureStackTrace" in Error) {
		Error.captureStackTrace(this, NotFoundException);
	} else {
		this.stack = new Error().stack;
	}
}

NotFoundException.prototype = Object.create(Error.prototype);
NotFoundException.prototype.name = "NotFoundException";
NotFoundException.prototype.constructor = NotFoundException;

module.exports = NotFoundException;
