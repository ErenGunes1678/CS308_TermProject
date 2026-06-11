import { DataTypes, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize) => {
  const Category = sequelize.define("categories", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: "categories",
    timestamps: true,
  });

  return Category;
};
