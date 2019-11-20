import {fail} from "assert";

process.env.NODE_ENV = 'test';

import sequelize from "../../dao/config/sequelizeConfig";

describe('sequelize', () => {
    it('should start up', async (done) => {
        sequelize
            .authenticate()
            .then(() => {
                sequelize.close();
                done();
            })
            .catch(err => {
                fail(err);
            });
    });
});
