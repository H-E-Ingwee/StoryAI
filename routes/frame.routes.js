const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const { createFrame, updateFrame, deleteFrame, getFrames } = require("../controllers/frame.controller");

const router = express.Router();

router.use(authenticate);
router.post("/", createFrame);
router.get("/scene/:sceneId", getFrames);
router.put("/:id", updateFrame);
router.delete("/:id", deleteFrame);

module.exports = router;
