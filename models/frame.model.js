const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Scene = require("./scene.model");

const Frame = sequelize.define("Frame", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sceneId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  prompt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

Frame.belongsTo(Scene, { foreignKey: "sceneId", onDelete: "CASCADE" });
Scene.hasMany(Frame, { foreignKey: "sceneId" });

module.exports = Frame;
