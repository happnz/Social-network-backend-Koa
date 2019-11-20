import {Sequelize} from "sequelize";
import config from "config";

const dbConfig = config.get('db');
const sequelize: Sequelize = new Sequelize(dbConfig.dbName, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: "postgres",
    define: {
        timestamps: false
    }
});

export default sequelize;
