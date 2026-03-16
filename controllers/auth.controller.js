const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const JWT_SECRET = process.env.JWT_SECRET || "storyai_secret";

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: "Invalid credentials." });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (error) {
    next(error);
  }
};

exports.profile = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
};
