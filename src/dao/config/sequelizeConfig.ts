import {Options, Sequelize} from "sequelize";
import * as config from "config";

const dbConfig = config.get('db');

require('pg').types.setTypeParser(1114, stringValue => { // prevent converting dates when reading from db
    return new Date(stringValue + '+0000');
});

let sequelize: Sequelize;
let options: Options = {
    host: dbConfig.host,
    dialect: "postgres",
    define: {
        timestamps: false
    }
};

if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, options);
} else {
    sequelize = new Sequelize(dbConfig.dbName, dbConfig.username, dbConfig.password, options);
}

export default sequelize;
