const Frame = require("../models/frame.model");

exports.createFrame = async (req, res, next) => {
  try {
    const { sceneId, title, prompt, imageUrl } = req.body;
    if (!sceneId || !title) {
      return res.status(400).json({ message: "sceneId and title are required" });
    }

    const frame = await Frame.create({
      sceneId,
      title,
      prompt: prompt || "",
      imageUrl: imageUrl || null,
      order: 0
    });
    res.status(201).json(frame);
  } catch (error) {
    next(error);
  }
};

exports.getFrames = async (req, res, next) => {
  try {
    const { sceneId } = req.params;
    const frames = await Frame.findAll({
      where: { sceneId },
      order: [["order", "ASC"]]
    });
    res.json(frames);
  } catch (error) {
    next(error);
  }
};

exports.updateFrame = async (req, res, next) => {
  try {
    const frame = await Frame.findByPk(req.params.id);
    if (!frame) return res.status(404).json({ message: "Frame not found" });

    const { title, prompt, imageUrl, order } = req.body;
    await frame.update({
      title: title ?? frame.title,
      prompt: prompt ?? frame.prompt,
      imageUrl: imageUrl ?? frame.imageUrl,
      order: order ?? frame.order
    });
    res.json(frame);
  } catch (error) {
    next(error);
  }
};

exports.deleteFrame = async (req, res, next) => {
  try {
    const frame = await Frame.findByPk(req.params.id);
    if (!frame) return res.status(404).json({ message: "Frame not found" });
    await frame.destroy();
    res.json({ message: "Frame deleted" });
  } catch (error) {
    next(error);
  }
};
