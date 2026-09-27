const { validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));

    return sendError(
      res,
      400,
      formattedErrors[0].message || 'Validation failed',
      'VALIDATION_ERROR',
      formattedErrors
    );
  };
};

module.exports = validate;
