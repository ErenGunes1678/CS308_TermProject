import { DataTypes, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize) => {
    const CartItem = sequelize.define("cart_items", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        cart_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "carts", key: "id" },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "products", key: "id" },
            onDelete: "RESTRICT",
            onUpdate: "CASCADE",
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 1,
            },
        },
    }, {
        tableName: "cart_items",
        timestamps: false,
        indexes: [
            // One row per (cart, product) — prevents duplicate lines for the same product.
            // Your addToCart logic already enforces this in code, but a DB-level
            // unique constraint protects against race conditions too.
            { unique: true, fields: ["cart_id", "product_id"] },
        ],
    });

    (CartItem as any).associate = (db: any) => {
        CartItem.belongsTo(db.carts, { foreignKey: "cart_id", as: "cart" });
        CartItem.belongsTo(db.products, { foreignKey: "product_id", as: "product" });
    };

    return CartItem;
};