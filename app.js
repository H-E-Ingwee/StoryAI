const path = require("path");
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./config/database");
const models = require("./models");
const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, ".")));

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Sync DB and ensure connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");
    await sequelize.sync({ alter: true });
    console.log("Database synced.");
  } catch (error) {
    console.error("Database sync error:", error);
  }
})();

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

module.exports = app;
