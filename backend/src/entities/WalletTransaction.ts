import { DataTypes, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize) => {
    const WalletTransaction = sequelize.define("wallet_transactions", {
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
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM("credit", "debit"),
            allowNull: false,
        },
        reason: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        reference_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    }, {
        tableName: "wallet_transactions",
        timestamps: true,
    });

    (WalletTransaction as any).associate = (db: any) => {
        WalletTransaction.belongsTo(db.users, {
            foreignKey: "user_id",
            as: "user",
            onDelete: "CASCADE",
        });
    };

    return WalletTransaction;
};
