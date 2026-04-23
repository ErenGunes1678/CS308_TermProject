import { DataTypes, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize) => {
    const Comment = sequelize.define("comments", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5,
            },
        },
        comment_text: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("pending", "approved", "rejected"),
            allowNull: false,
            defaultValue: "pending",
        },
        approved_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        approved_at: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    }, {
        tableName: "comments",
        timestamps: true,
    });

    (Comment as any).associate = (db: any) => {
        Comment.belongsTo(db.users, {
            foreignKey: "user_id",
            as: "user",
        });

        Comment.belongsTo(db.products, {
            foreignKey: "product_id",
            as: "product",
        });

        Comment.belongsTo(db.users, {
            foreignKey: "approved_by",
            as: "approver",
        });
    };

    return Comment;
};