process.env.NODE_ENV = 'test';

import server from '../../index';

const chai = require('chai');
chai.use(require('chai-http'));
const jest = require("jest");
const expect = jest.expect;
import * as config from "config";

describe('AuthRouter', () => {
    beforeEach(() => {
        //TODO run migrations
    });

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
                expect(res).to.have.cookie(config.get('cookieName'))
            });
    });

    it('should not add a user with invalid email', () => {
        let userBody = {
            email: 'emailemail.com',
            name: 'userName',
            lastName: 'userLastName',
            password: '123456'
        };

        chai.request(server)
            .post('/sign-up')
            .send(userBody)
            .end((err, res) => {
                expect(err).toBeDefined();
                expect(res.status).toBe(400);
                expect(res).to.have.cookie(config.get('cookieName'));
            });
    })
});
