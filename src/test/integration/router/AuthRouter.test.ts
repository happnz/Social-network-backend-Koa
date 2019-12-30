process.env.NODE_ENV = 'test';

import server from '../../../index';

import DBMigrate = require("db-migrate");
import "mocha";
import * as chai from "chai";
import chaiHttp = require('chai-http');
import chaiSubset = require("chai-subset");
import {expect} from "chai";
import * as config from "config";

const dbMigrate = DBMigrate.getInstance(true, {
    env: "test"
});
dbMigrate.silence(true);

chai.use(chaiHttp);
chai.use(chaiSubset);

describe('AuthRouter', () => {
    async function resetDb() {
        await dbMigrate.reset()
            .then(() => dbMigrate.up(2));
    }

    describe('POST /sign-up', () => {
        beforeEach(resetDb);

        it('should add a user', async () => {
            let userBody = {
                email: 'email@email.com',
                name: 'userName',
                lastName: 'userLastName',
                password: '123456'
            };

            const res = await chai.request(server)
                .post('/sign-up')
                .send(userBody);

            expect(res.status).to.equal(200);
            delete userBody.password;
            expect(res.body).to.containSubset(userBody);
            expect(res).to.have.cookie(config.get('cookieName'));
        });

        it('should not add a user with invalid email and short password', async () => {
            let userBody = {
                email: 'emailemail.com',
                name: 'userName',
                lastName: 'userLastName',
                password: '12345'
            };

            const res = await chai.request(server)
                .post('/sign-up')
                .send(userBody);

            expect(res.status).to.equal(400);
            expect(res.body.map(fieldError => fieldError.field)).to.deep.equal(['email', 'password']);
            expect(res).to.not.have.cookie(config.get('cookieName'));
        });
    });

    describe('POST /sign-in', () => {
        beforeEach(resetDb);

        it('should not authenticate nonexistent user', async () => {
            let authBody = {
                email: 'email@email.com',
                password: '123456'
            };

            const res = await chai.request(server)
                .post('/sign-in')
                .send(authBody);

            expect(res.status).to.equal(401);
        });

        it('should authenticate existing user', async () => {
            let userBody = {
                email: 'email@email.com',
                name: 'userName',
                lastName: 'userLastName',
                password: '123456'
            };

            const res = await chai.request(server)
                .post('/sign-up')
                .send(userBody);

            expect(res.status).to.equal(200);

            let authBody = {
                email: 'email@email.com',
                password: '123456'
            };

            const res2 = await chai.request(server)
                .post('/sign-in')
                .send(authBody);

            expect(res2.status).to.equal(200);
        });

        it('should not authenticate existing user with wrong password', async () => {
            let userBody = {
                email: 'email@email.com',
                name: 'userName',
                lastName: 'userLastName',
                password: 'word123'
            };

            const res = await chai.request(server)
                .post('/sign-up')
                .send(userBody);

            expect(res.status).to.equal(200);

            let authBody = {
                email: 'email@email.com',
                password: 'wOrd123'
            };

            const res2 = await chai.request(server)
                .post('/sign-in')
                .send(authBody);

            expect(res2.status).to.equal(401);
        });
    });

    describe('POST /sign-out', () => {
        beforeEach(resetDb);

       it('should remove cookie on sign-out for authenticated user', async () => {
           let userBody = {
               email: 'email@email.com',
               name: 'userName',
               lastName: 'userLastName',
               password: '123456'
           };

           const res = await chai.request(server)
               .post('/sign-up')
               .send(userBody);

           expect(res).to.have.cookie(config.get('cookieName'));

           const res2 = await chai.request(server)
               .post('/sign-out')
               .send();

           expect(res2).to.not.have.cookie(config.get('cookieName'));
       });

       it('should throw 401 for unauthenticated user', async () => {
           const res = await chai.request(server)
               .post('/sign-out')
               .send();

           expect(res.status).to.equal(401);
       });
    });
});
