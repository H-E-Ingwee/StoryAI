const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Project = require("./project.model");

const Scene = sequelize.define("Scene", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

Scene.belongsTo(Project, { foreignKey: "projectId", onDelete: "CASCADE" });
Project.hasMany(Scene, { foreignKey: "projectId" });

module.exports = Scene;
