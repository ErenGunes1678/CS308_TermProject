import { Sequelize, DataTypes } from "sequelize";
import path from "path";
import fs from "fs";

const sequelize = new Sequelize({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dialect: "postgres",
    logging: false,
});

const db: { [key: string]: any } = {};

// Auto-load all model files in this directory
fs.readdirSync(__dirname)
    .filter(file => {
        return (
            file.indexOf(".") !== 0 &&
            file !== path.basename(__filename) &&
            (file.slice(-3) === ".ts" || file.slice(-3) === ".js") &&
            file.indexOf(".test.ts") === -1
        );
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize, DataTypes);
        db[model.name] = model;
    });

// Run associations if any model defines them
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export { sequelize };
export default db;