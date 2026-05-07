//
// Task 9: A product should have the following properties at the very least: 
// ID, name, model, serial number, description, quantity in stocks, price, 
// warranty status, and distributor information.

import { DataTypes, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize) => {
  const Product = sequelize.define("products", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    category: {
      type: DataTypes.ENUM("makeup", "skincare", "haircare", "men-care"),
      allowNull: false,
    },

    subcategory: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "general",
    },

    model: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    serial_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    quantity_in_stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    original_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    rating: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: false,
      defaultValue: 4.0,
    },

    review_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    badge: {
      type: DataTypes.ENUM("BEST", "NEW", "LIMITED", "SALE"),
      allowNull: true,
    },

    warranty_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    distributor_info: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    tableName: "products",
    timestamps: false,
  });

  (Product as any).associate = (db: any) => {
    Product.hasMany(db.comments, {
      foreignKey: "product_id",
      as: "comments",
      onDelete: "CASCADE",
    });
  };

  return Product;
};
