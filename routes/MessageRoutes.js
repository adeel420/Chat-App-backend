const express = require("express");
const {
  createMessage,
  getMessageByLoginId,
} = require("../controllers/messageController");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
// router.use(express.static("public"));

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "chat-app-images", // e.g., 'chat-app-images'
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
  const isValid = allowedTypes.test(file.mimetype);
  isValid
    ? cb(null, true)
    : cb(new Error("Only images and videos are allowed"));
};

const upload = multer({ storage, fileFilter });

router.post("/:sender/:receiver", upload.single("image"), createMessage);
router.get("/:loginId", getMessageByLoginId);

module.exports = router;
