const sendSuccess = (res, statusCode = 200, data = {}, extra = {}) => {
  return res.status(statusCode).json({
    success: true,
    data,
    ...extra
  });
};

const sendError = (res, statusCode = 500, message = 'An unexpected error occurred', code = 'INTERNAL_ERROR', details = null) => {
  const errorObj = {
    message,
    code
  };
  if (details) {
    errorObj.details = details;
  }
  return res.status(statusCode).json({
    success: false,
    error: errorObj
  });
};

module.exports = {
  sendSuccess,
  sendError
};
