import { DataTypes, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize) => {
    const OrderItem = sequelize.define("order_items", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        order_id: {
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
        },
        unit_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    }, {
        tableName: "order_items",
        timestamps: false,
    });

    (OrderItem as any).associate = (db: any) => {
        OrderItem.belongsTo(db.orders, { foreignKey: "order_id", as: "order" });
        OrderItem.belongsTo(db.products, { foreignKey: "product_id", as: "product" });
    };

    return OrderItem;
};