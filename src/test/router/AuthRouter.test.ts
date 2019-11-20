process.env.NODE_ENV = 'test';

import server from '../../index';

const chai = require('chai');
chai.use(require('chai-http'));
const jest = require("jest");
const expect = jest.expect;

describe('AuthRouter', () => {
    it('should add a user', () => {
        let userBody = {
            email: 'email@email.com',
            name: 'userName',
            lastName: 'userLastName',
            password: '123456'
        };

        chai.request(server)
            .post('/sign-up')
            .send(userBody)
            .end((err, res) => {
                expect(err).toBeFalsy();
                expect(res.status).toBe(200);
                expect(res.body).toMatchObject(userBody);
            });
    })
});
