import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const uri = process.env.MONGODB_URI;

console.log("=================================================");
console.log("🔍 Testing MongoDB Atlas Connection...");
console.log("=================================================");
console.log(`URI: ${uri ? uri.replace(/:[^@/]+@/, ":****@") : "MISSING (check .env)"}`);
console.log("-------------------------------------------------");

if (!uri) {
  console.log("❌ ERROR: MONGODB_URI is not set in your .env file!");
  process.exit(1);
}

try {
  console.log("Connecting...");
  const start = Date.now();
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000 // 5 seconds timeout
  });
  console.log(`\n✅ SUCCESS: Connected to MongoDB Atlas!`);
  console.log(`Host: ${conn.connection.host}`);
  console.log(`Database Name: ${conn.connection.name}`);
  console.log(`Connection Time: ${Date.now() - start}ms`);
  await mongoose.disconnect();
  console.log("\nDisconnected successfully.");
} catch (error) {
  console.log(`\n❌ ERROR: Connection failed!`);
  console.log(`Error Message: ${error.message}`);
  console.log("\n-------------------------------------------------");
  console.log("💡 Troubleshooting Steps:");
  if (error.message.includes("IP") || error.message.includes("timeout") || error.message.includes("ETIMEDOUT") || error.message.includes("status 504")) {
    console.log("1. IP Whitelist Issue: MongoDB Atlas blocks all connections by default.");
    console.log("   - Log in to your MongoDB Atlas dashboard.");
    console.log("   - Go to 'Network Access' (under Security) in the left menu.");
    console.log("   - Click 'Add IP Address'.");
    console.log("   - Select 'Allow Access From Anywhere' (adds IP 0.0.0.0/0) or add your current IP address.");
    console.log("   - Click 'Confirm' and wait 1 minute for it to apply, then run this test again.");
  } else if (error.message.includes("auth") || error.message.includes("Authentication failed")) {
    console.log("1. Authentication Failure: The username or password in MONGODB_URI is incorrect.");
    console.log("   - Double-check the username and password in your .env MONGODB_URI.");
    console.log("   - Note: If your password has special characters (like @, :, /, +), they must be URL-encoded, or you should change the password to contain only letters and numbers.");
  } else {
    console.log("1. Double-check your connection string in the .env file.");
    console.log("2. Ensure you have an active internet connection.");
  }
}
console.log("=================================================");
