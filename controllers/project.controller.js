const Project = require("../models/project.model");

exports.createProject = async (req, res, next) => {
  try {
    const { title, genre, status, scenes, frames, description } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const project = await Project.create({
      userId: req.user.id,
      title,
      genre: genre || "Creative",
      status: status || "draft",
      scenes: Number(scenes) || 0,
      frames: Number(frames) || 0,
      description: description || ""
    });
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]]
    });
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const { title, genre, status, scenes, frames, description } = req.body;
    await project.update({
      title: title ?? project.title,
      genre: genre ?? project.genre,
      status: status ?? project.status,
      scenes: scenes !== undefined ? Number(scenes) : project.scenes,
      frames: frames !== undefined ? Number(frames) : project.frames,
      description: description ?? project.description
    });

    res.json(project);
  } catch (error) {
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!project) return res.status(404).json({ message: "Project not found" });
    await project.destroy();
    res.json({ message: "Project deleted" });
  } catch (error) {
    next(error);
  }
};
