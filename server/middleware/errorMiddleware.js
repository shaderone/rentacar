const errorHandler = (err, req, res, next) => {
    // If the status code is 200 (OK) but there is an error, default to 500 (Server Error)
    console.error(err.stack);

    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // handle specific error types
    if (err.code === 11000) {
        statusCode = 400;
        message = "Duplicate field value entered";
    }

    // add more custom errors here 

    res.status(statusCode);

    res.json({
        message: err.message,
        // Only show stack trace in development mode
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { errorHandler };