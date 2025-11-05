function getCorsOptions() {
  const originsEnv = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '';
  const origins = originsEnv
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  return {
    origin: function (origin, callback) {
      // Allow no-origin (mobile apps, curl) and explicit matches
      if (!origin || origins.length === 0 || origins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  };
}

module.exports = { getCorsOptions };
