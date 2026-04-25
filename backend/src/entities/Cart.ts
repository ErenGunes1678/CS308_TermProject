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
            references: { model: "users", key: "id" },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        session_id: {
            type: DataTypes.STRING,
            allowNull: true, // used for guest carts
        },
    }, {
        tableName: "carts",
        timestamps: false,
        indexes: [
            // A user has at most one cart.
            { unique: true, fields: ["user_id"], where: { user_id: { [Symbol.for("ne")]: null } } },
            // A guest session has at most one cart.
            { unique: true, fields: ["session_id"], where: { session_id: { [Symbol.for("ne")]: null } } },
        ],
    });

    (Cart as any).associate = (db: any) => {
        Cart.belongsTo(db.users, { foreignKey: "user_id", as: "user" });
        Cart.hasMany(db.cart_items, {
            foreignKey: "cart_id",
            as: "items",
            onDelete: "CASCADE",
            hooks: true,
        });
    };

    return Cart;
};