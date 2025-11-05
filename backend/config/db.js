const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    if ((process.env.ALLOW_NO_DB || 'false').toLowerCase() === 'true') {
      console.warn('MONGO_URI not set. Starting without DB connection (ALLOW_NO_DB=true).');
      return;
    }
    throw new Error('MONGO_URI is not set');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    dbName: process.env.MONGO_DB || undefined,
  });
  console.log('MongoDB connected');
}

module.exports = { connectDB };
