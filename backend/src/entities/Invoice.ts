import { DataTypes, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize) => {
    const Invoice = sequelize.define("invoices", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        invoice_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        file_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        customer_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        discount_code: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        discount_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0,
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        tableName: "invoices",
        timestamps: true,
    });

    (Invoice as any).associate = (db: any) => {
        Invoice.belongsTo(db.orders, { foreignKey: "order_id", as: "order" });
    };

    return Invoice;
};
