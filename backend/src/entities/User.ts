import { DataTypes, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize) => {
    const User = sequelize.define("users", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tax_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        role: {
            type: DataTypes.ENUM("customer", "sales_manager", "product_manager"),
            allowNull: false,
            defaultValue: "customer",
        }
    }, {
        tableName: "users",
        timestamps: false,
    });

    (User as any).associate = (db: any) => {
        User.hasMany(db.comments, {
            foreignKey: "user_id",
            as: "comments",
            onDelete: "CASCADE",
        });

        User.hasMany(db.comments, {
            foreignKey: "approved_by",
            as: "approvedComments",
        });
    };

    return User;
};
