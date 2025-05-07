const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const {
  createMessage,
  getMessageByLoginId,
} = require("../controllers/messageController");

// Setup Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "chat-app-files", // You can change this to "chat-app-images" if only images
      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "mp4",
        "mov",
        "avi",
        "webm",
      ],
      resource_type: file.mimetype.startsWith("video/") ? "video" : "image",
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`, // optional: unique name
    };
  },
});

// Filter allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
  const isValid = allowedTypes.test(file.mimetype);
  isValid
    ? cb(null, true)
    : cb(new Error("Only images and videos are allowed"));
};

const upload = multer({ storage, fileFilter });

// Routes
router.post("/:sender/:receiver", upload.single("image"), createMessage);
router.get("/:loginId", getMessageByLoginId);

module.exports = router;
