const Scene = require("../models/scene.model");

exports.createScene = async (req, res, next) => {
  try {
    const { projectId, title, description } = req.body;
    if (!projectId || !title) {
      return res.status(400).json({ message: "projectId and title are required" });
    }

    const scene = await Scene.create({
      projectId,
      title,
      description: description || "",
      order: 0
    });
    res.status(201).json(scene);
  } catch (error) {
    next(error);
  }
};

exports.getScenes = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const scenes = await Scene.findAll({
      where: { projectId },
      order: [["order", "ASC"]]
    });
    res.json(scenes);
  } catch (error) {
    next(error);
  }
};

exports.updateScene = async (req, res, next) => {
  try {
    const scene = await Scene.findByPk(req.params.id);
    if (!scene) return res.status(404).json({ message: "Scene not found" });

    const { title, description, order } = req.body;
    await scene.update({
      title: title ?? scene.title,
      description: description ?? scene.description,
      order: order ?? scene.order
    });
    res.json(scene);
  } catch (error) {
    next(error);
  }
};

exports.deleteScene = async (req, res, next) => {
  try {
    const scene = await Scene.findByPk(req.params.id);
    if (!scene) return res.status(404).json({ message: "Scene not found" });
    await scene.destroy();
    res.json({ message: "Scene deleted" });
  } catch (error) {
    next(error);
  }
};
