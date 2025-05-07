const Message = require("../models/messageModel");

exports.createMessage = async (req, res) => {
  try {
    const senderId = req.params.sender;
    const receiverId = req.params.receiver;
    const { message } = req.body;

    let media = "";
    if (req.file && req.file.path) {
      media = req.file.path;
    }

    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      message,
      media,
    });

    const response = await newMessage.save();
    res.status(201).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getMessageByLoginId = async (req, res) => {
  try {
    const loginId = req.params.loginId;
    const response = await Message.find({
      $or: [{ sender: loginId }, { receiver: loginId }],
    }).sort({ createdAt: 1 }); // sort by oldest to newest
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
