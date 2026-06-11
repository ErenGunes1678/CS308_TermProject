import { DataTypes, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize) => {
    const Address = sequelize.define("addresses", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "users", key: "id" },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        label: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        street: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        state: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        zip: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_default: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    }, {
        tableName: "addresses",
        timestamps: true,
    });

    (Address as any).associate = (db: any) => {
        Address.belongsTo(db.users, { foreignKey: "user_id", as: "user" });
        db.users.hasMany(Address, {
            foreignKey: "user_id",
            as: "addresses",
            onDelete: "CASCADE",
        });
    };

    return Address;
};
