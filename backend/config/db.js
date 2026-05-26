import mongoose from "mongoose";

export default async function connectDB() {
  const uri = process.env.MONGODB_URI;

  try {
    if (!uri) throw new Error("MONGODB_URI is missing in .env");
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.dbError = null;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    global.dbError = error.message;
    process.exit(1); // Exit process on db connection failure for production environment
  }
}
