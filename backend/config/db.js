import mongoose from "mongoose";

export default async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const localUri = "mongodb://127.0.0.1:27017/atomic_media";

  try {
    if (!uri) throw new Error("MONGODB_URI is missing in .env");
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Primary MongoDB connection failed: ${error.message}`);
    global.dbError = error.message;

    // Try fallback to local MongoDB
    try {
      console.log(`Attempting connection to local MongoDB fallback: ${localUri}`);
      const conn = await mongoose.connect(localUri);
      console.log(`MongoDB connected to local fallback: ${conn.connection.host}`);
      global.dbError = null; // cleared since we succeeded
    } catch (localError) {
      console.error(`Local MongoDB fallback connection also failed: ${localError.message}`);
      global.dbError = `Primary DB: ${error.message} | Local Fallback: ${localError.message}`;
    }
  }
}
