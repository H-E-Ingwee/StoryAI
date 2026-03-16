const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Frame = require("./frame.model");

const Prompt = sequelize.define("Prompt", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  frameId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  style: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

Prompt.belongsTo(Frame, { foreignKey: "frameId", onDelete: "CASCADE" });
Frame.hasMany(Prompt, { foreignKey: "frameId" });

module.exports = Prompt;
