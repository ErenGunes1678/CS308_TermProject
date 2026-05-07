import { DataTypes, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize) => {
    const Order = sequelize.define("orders", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("processing", "in-transit", "delivered", "cancelled"),
            allowNull: false,
            defaultValue: "processing",
        },
    }, {
        tableName: "orders",
        timestamps: true,
    });

    (Order as any).associate = (db: any) => {
        Order.belongsTo(db.users, { foreignKey: "user_id", as: "user" });
        Order.hasMany(db.order_items, { foreignKey: "order_id", as: "items" });
    };

    return Order;
};