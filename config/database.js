const { Sequelize } = require("sequelize");

const dialect = process.env.DB_DIALECT || "sqlite";

const sequelize = new Sequelize({
  dialect,
  storage: process.env.DB_STORAGE || "storyai_dev.sqlite",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "storyai",
  username: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  logging: false
});

module.exports = { sequelize };
