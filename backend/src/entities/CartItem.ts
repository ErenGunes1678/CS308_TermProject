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
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
    }, {
        tableName: "cart_items",
        timestamps: false,
    });

    (CartItem as any).associate = (db: any) => {
        CartItem.belongsTo(db.carts, { foreignKey: "cart_id", as: "cart" });
        CartItem.belongsTo(db.products, { foreignKey: "product_id", as: "product" });
    };

    return CartItem;
};