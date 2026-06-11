import { DataTypes, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize) => {
    const HiddenReviewPrompt = sequelize.define("hidden_review_prompts", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        tableName: "hidden_review_prompts",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ["user_id", "product_id"],
            },
        ],
    });

    (HiddenReviewPrompt as any).associate = (db: any) => {
        HiddenReviewPrompt.belongsTo(db.users, {
            foreignKey: "user_id",
            as: "user",
            onDelete: "CASCADE",
        });
        HiddenReviewPrompt.belongsTo(db.products, {
            foreignKey: "product_id",
            as: "product",
            onDelete: "CASCADE",
        });
    };

    return HiddenReviewPrompt;
};
