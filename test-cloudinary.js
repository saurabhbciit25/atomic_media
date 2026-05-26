import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

console.log("=================================================");
console.log("🔍 Testing Cloudinary Connection...");
console.log("=================================================");
console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME || "MISSING"}`);
console.log(`API Key: ${process.env.CLOUDINARY_API_KEY || "MISSING"}`);
console.log(`API Secret: ${process.env.CLOUDINARY_API_SECRET ? "****" : "MISSING"}`);
console.log("-------------------------------------------------");

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.log("❌ ERROR: Cloudinary credentials are missing in your .env file!");
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

try {
  console.log("Pinging Cloudinary API...");
  const result = await cloudinary.api.ping();
  console.log(`\n✅ SUCCESS: Connected to Cloudinary!`);
  console.log(`Response:`, result);
} catch (error) {
  console.log(`\n❌ ERROR: Cloudinary connection failed!`);
  console.log(`Error Details:`, error);
  if (error.error && error.error.message) {
    console.log(`Reason: ${error.error.message}`);
  } else if (error.message) {
    console.log(`Reason: ${error.message}`);
  } else {
    console.log(`Reason: ${JSON.stringify(error)}`);
  }
  console.log("\n-------------------------------------------------");
  console.log("💡 Troubleshooting Steps:");
  console.log("1. Check if the CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env are correct.");
  console.log("2. Ensure your computer has an active internet connection.");
}
console.log("=================================================");
