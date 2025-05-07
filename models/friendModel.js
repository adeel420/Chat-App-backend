const mongoose = require("mongoose");

const friendSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to User model
    required: true,
  },
  friend: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // The other user in the friendship
    required: true,
  },
});

const Friend = mongoose.model("friend", friendSchema);
module.exports = Friend;
