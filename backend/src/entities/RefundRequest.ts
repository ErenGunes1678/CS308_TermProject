import { DataTypes, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize) => {
    const RefundRequest = sequelize.define("refund_requests", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        order_item_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("pending", "approved", "rejected"),
            allowNull: false,
            defaultValue: "pending",
        },
        refund_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        requested_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        resolved_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        resolved_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    }, {
        tableName: "refund_requests",
        timestamps: false,
    });

    (RefundRequest as any).associate = (db: any) => {
        RefundRequest.belongsTo(db.order_items, { foreignKey: "order_item_id", as: "orderItem" });
        RefundRequest.belongsTo(db.users, { foreignKey: "user_id", as: "user" });
        RefundRequest.belongsTo(db.users, { foreignKey: "resolved_by", as: "resolver" });
    };

    return RefundRequest;
};
