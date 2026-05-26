import cloudinary from "../config/cloudinary.js";

export async function uploadImage(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(dataUrl, { folder: "atomic-media" });
    res.status(201).json({ url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    next(error);
  }
}
