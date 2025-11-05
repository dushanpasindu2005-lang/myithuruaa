const mongoose = require('mongoose');

let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

async function connect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable. Create a `.env.local` in the project root (you can copy `.env.local.example`) and set MONGODB_URI to your MongoDB connection string.');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // other options can be added here
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connect;
