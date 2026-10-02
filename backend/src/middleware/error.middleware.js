const { sendError } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'INTERNAL_ERROR';
  let details = null;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format for parameter: ${err.path}`;
    code = 'INVALID_ID';
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists`;
    code = 'DUPLICATE_KEY';
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    code = 'VALIDATION_ERROR';
    details = Object.keys(err.errors).map((key) => ({
      field: key,
      message: err.errors[key].message
    }));
  }

  // Handle JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
    code = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
    code = 'TOKEN_EXPIRED';
  }

  // Log unexpected errors
  if (statusCode === 500) {
    console.error('SERVER ERROR:', err);
  }

  return sendError(res, statusCode, message, code, details);
};

const notFoundHandler = (req, res, next) => {
  return sendError(res, 404, `Endpoint ${req.originalUrl} not found`, 'NOT_FOUND');
};

module.exports = {
  errorHandler,
  notFoundHandler
};
