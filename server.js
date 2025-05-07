const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();
const db = require("./db");
const userRoutes = require("./routes/UserRoutes");
const friendRoutes = require("./routes/FriendRoutes");
const messageRoutes = require("./routes/MessageRoutes");
const passport = require("./middleware/auth");
const cors = require("cors");

// Packages
app.use(cors());
app.use(bodyParser.json());
const PORT = process.env.PORT || 8080;
app.use(passport.initialize());
const authMiddleware = passport.authenticate("local", { session: false });

// Routes
app.use("/user", userRoutes);
app.use("/friend", friendRoutes);
app.use("/message", messageRoutes);

app.get("/", async (req, res) => {
  res.send("Heelo");
});

app.listen(PORT, () => {
  console.log(`Listening the port ${PORT}`);
});
