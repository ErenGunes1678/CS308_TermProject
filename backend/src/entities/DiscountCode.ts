import { DataTypes, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize) => {
    const DiscountCode = sequelize.define("discount_codes", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            set(value: string) {
                (this as any).setDataValue("code", value.toUpperCase());
            },
        },
        type: {
            type: DataTypes.ENUM("percentage", "fixed", "free_shipping"),
            allowNull: false,
        },
        value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        min_order: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        expiry_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        uses_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    }, {
        tableName: "discount_codes",
        timestamps: true,
    });

    return DiscountCode;
};
