const express = require("express");
const { createRequest, all } = require("../controllers/friendController");
const { jwtAuthMiddleware } = require("../middleware/jwt");
const router = express.Router();

router.post("/:loginId/:userId", createRequest);
router.get("/:loginId", jwtAuthMiddleware, all);

module.exports = router;
