const CustomError = require('../utils/CustomError');

const prodError = (err, res) => {
    if (err.isOparational) {

        res.status(err.statusCode).json({ message: err.message, success: false });
    }
    else {
        res.status(500).json({ success: false, message: "Something Went Wrong Please try Later" });
    }
}

const handleCastError = (err) => {
    const message = `Invalid Value for ${err.path}`;
    return new CustomError(message, 400);
}

const handleDuplicateError = (err) => {
    const keyValue = Object.entries(err.keyValue);
    const message = `The ${keyValue[0][0]}: ${keyValue[0][1]} is already used`;

    return new CustomError(message, 400);
}

const handleValidateError = (err) => {
    const errors = Object.values(err.errors);

    const message = errors[0].message;

    return new CustomError(message, 400);
}

const handleTokenError = (err) => {
    return new CustomError("Expired or Invalid Token", 400);
};

module.exports = (error, req, res, next) => {


    if (process.env.NODE_ENV === 'development') {

        res.status(400).json({ message: error.message, success: false, error });

    } else if (process.env.NODE_ENV === 'production') {

        err = { ...error, name: error.name, message: error.message };
        if (err.name === "castError") err = handleCastError(err);
        if (err.code === 11000) err = handleDuplicateError(err);
        if (err.name === "ValidationError") err = handleValidateError(err);
        if (err.name === "TokenExpiredError") err = handleTokenError(err);
        if (err.name === "JsonWebTokenError") err = handleTokenError(err);
        prodError(err, res)
    }

}