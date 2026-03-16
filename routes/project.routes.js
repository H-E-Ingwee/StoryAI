const express = require("express");
const {
  createProject,
  updateProject,
  deleteProject,
  getProjects,
  getProjectById
} = require("../controllers/project.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticate);
router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

module.exports = router;
