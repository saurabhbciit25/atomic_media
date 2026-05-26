import mongoose from "mongoose";

let cachedConnection = null;

export default async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing in environment variables");
  }

  if (!cachedConnection) {
    cachedConnection = mongoose.connect(uri).then((conn) => {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      global.dbError = null;
      return conn;
    }).catch((error) => {
      console.error(`MongoDB Connection Error: ${error.message}`);
      global.dbError = error.message;
      cachedConnection = null; // Reset cache so we try again on next request
      throw error;
    });
  }

  return cachedConnection;
}
