const bcrypt = require("bcrypt");const bcrypt = require("bcrypt");
























































};  }    next(error);  } catch (error) {    res.json({ user: { id: user.id, name: user.name, email: user.email } });    const user = req.user;  try {exports.profile = async (req, res, next) => {};  }    next(error);  } catch (error) {    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });    if (!match) return res.status(401).json({ message: "Invalid credentials." });    const match = await bcrypt.compare(password, user.passwordHash);    if (!user) return res.status(401).json({ message: "Invalid credentials." });    const user = await User.findOne({ where: { email } });    }      return res.status(400).json({ message: "Email and password are required." });    if (!email || !password) {    const { email, password } = req.body;  try {exports.login = async (req, res, next) => {};  }    next(error);  } catch (error) {    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email }, token });    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });    const user = await User.create({ name, email, passwordHash });    const passwordHash = await bcrypt.hash(password, 10);    }      return res.status(409).json({ message: "Email already registered." });    if (existing) {    const existing = await User.findOne({ where: { email } });    }      return res.status(400).json({ message: "Name, email and password are required." });    if (!name || !email || !password) {    const { name, email, password } = req.body;  try {exports.register = async (req, res, next) => {const JWT_SECRET = process.env.JWT_SECRET || "storyai-secret";const User = require("../models/user.model");const jwt = require("jsonwebtoken");const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const JWT_SECRET = process.env.JWT_SECRET || "storyai_secret";
const TOKEN_EXPIRES_IN = "7d";

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    res.status(201).json({ message: "User registered successfully", user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
}

async function profile(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ["id", "name", "email", "createdAt"] });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, profile };
