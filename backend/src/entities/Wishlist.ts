import { DataTypes, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize) => {
    const Wishlist = sequelize.define("wishlists", {
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
    }, {
        tableName: "wishlists",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["user_id", "product_id"],
            },
        ],
    });

    (Wishlist as any).associate = (db: any) => {
        Wishlist.belongsTo(db.users, {
            foreignKey: "user_id",
            as: "user",
            onDelete: "CASCADE",
        });

        Wishlist.belongsTo(db.products, {
            foreignKey: "product_id",
            as: "product",
            onDelete: "CASCADE",
        });

        db.users.hasMany(Wishlist, {
            foreignKey: "user_id",
            as: "wishlistItems",
        });

        db.products.hasMany(Wishlist, {
            foreignKey: "product_id",
            as: "wishlistedBy",
        });
    };

    return Wishlist;
};
