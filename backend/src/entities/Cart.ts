import { DataTypes, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize) => {
    const Cart = sequelize.define("carts", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true, // null = guest cart
        },
        session_id: {
            type: DataTypes.STRING,
            allowNull: true, // used for guest carts
        },
    }, {
        tableName: "carts",
        timestamps: false,
    });

    (Cart as any).associate = (db: any) => {
        Cart.belongsTo(db.users, { foreignKey: "user_id", as: "user" });
        Cart.hasMany(db.cart_items, { foreignKey: "cart_id", as: "items" });
    };

    return Cart;
};