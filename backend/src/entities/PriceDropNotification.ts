import { DataTypes, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize) => {
    const PriceDropNotification = sequelize.define("price_drop_notifications", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "users", key: "id" },
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "products", key: "id" },
        },
        old_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        new_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    }, {
        tableName: "price_drop_notifications",
        timestamps: true,
    });

    (PriceDropNotification as any).associate = (db: any) => {
        PriceDropNotification.belongsTo(db.users, {
            foreignKey: "user_id",
            as: "user",
            onDelete: "CASCADE",
        });

        PriceDropNotification.belongsTo(db.products, {
            foreignKey: "product_id",
            as: "product",
            onDelete: "CASCADE",
        });
    };

    return PriceDropNotification;
};
