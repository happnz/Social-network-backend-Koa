process.env.NODE_ENV = 'test';

import sequelize from "../../dao/config/sequelizeConfig";

describe('sequelize', () => {
    it('should start up', (done) => {
        sequelize
            .authenticate()
            .then(() => {
                sequelize.close();
                done();
            })
            .catch(err => {
                throw new Error('Error initializing sequelize');
            });
    });
});
