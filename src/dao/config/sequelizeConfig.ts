import {Sequelize} from "sequelize";
import * as config from "config";

const dbConfig = config.get('db');

require('pg').types.setTypeParser(1114, stringValue => { // prevent converting dates when reading from db
    return new Date(stringValue + '+0000');
});

const sequelize: Sequelize = new Sequelize(dbConfig.dbName, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: "postgres",
    define: {
        timestamps: false
    }
});

export default sequelize;
