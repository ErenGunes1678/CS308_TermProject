import { DataTypes, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize) => {
    const NotificationSeen = sequelize.define("notification_seen", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        notification_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        tableName: "notification_seen",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ["user_id", "notification_id"],
            },
        ],
    });

    (NotificationSeen as any).associate = (db: any) => {
        NotificationSeen.belongsTo(db.users, {
            foreignKey: "user_id",
            as: "user",
            onDelete: "CASCADE",
        });
    };

    return NotificationSeen;
};
