const Friend = require("../models/friendModel");
const User = require("../models/userModel");

exports.createRequest = async (req, res) => {
  try {
    const loginUser = req.params.loginId;
    const otherUser = req.params.userId;
    const existing = await Friend.findOne({
      user: loginUser,
      friend: otherUser,
    });
    if (existing) {
      return res.status(400).json({ error: "Friend request already sent" });
    }
    const data = new Friend({
      user: loginUser,
      friend: otherUser,
    });
    const response = await data.save();
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};

exports.all = async (req, res) => {
  try {
    const loginUser = req.params.loginId;

    const response = await Friend.find({ user: loginUser }).populate(
      "friend",
      "name profile"
    );

    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
