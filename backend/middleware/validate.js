const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const mapped = errors.array().map((e) => ({ field: e.path, msg: e.msg }));
  return res.status(422).json({ message: 'Validation failed', errors: mapped });
}

module.exports = { validate };
