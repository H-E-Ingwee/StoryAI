const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const { createScene, updateScene, deleteScene, getScenes } = require("../controllers/scene.controller");

const router = express.Router();

router.use(authenticate);
router.post("/", createScene);
router.get("/project/:projectId", getScenes);
router.put("/:id", updateScene);
router.delete("/:id", deleteScene);

module.exports = router;
