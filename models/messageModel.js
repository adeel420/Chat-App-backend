const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    message: { type: String },
    media: { type: String },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Message = mongoose.model("message", messageSchema);
module.exports = Message;
