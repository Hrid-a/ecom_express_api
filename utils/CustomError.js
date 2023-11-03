
class CustomError extends Error {

    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOparational = true;
        Error.captureStackTrace(this, this.contructor);

    }
}

module.exports = CustomError;
