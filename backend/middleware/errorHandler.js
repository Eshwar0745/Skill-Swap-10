function notFound(req, res, next) {
  res.status(404);
  res.json({ message: 'Not Found' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {})
  });
}

module.exports = { notFound, errorHandler };
