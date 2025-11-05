const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not set');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    dbName: process.env.MONGO_DB || undefined,
  });
  console.log('MongoDB connected');
}

module.exports = { connectDB };
