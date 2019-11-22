import {Store} from "koa-session2";
import sequelize from "./sequelizeConfig";

export default class SessionStore extends Store {
    constructor() {
        super();
    }

    async get(token) {
        return await sequelize.query('SELECT user_id FROM "sessions" WHERE token = ?', {
            replacements: token, type: 'SELECT'
        });
    }

    async set(userId, { token =  super.getID(24), maxAge = 1000000 } = {}) {
        try {
            sequelize.query('INSERT INTO "sessions" (user_id, token) VALUES ($1, $2) ' +
                'ON CONFLICT (user_id, token) DO UPDATE SET token = $2', {
                bind: [userId, token],
                type: 'UPSERT'
            });
        } catch (e) {}
        return token;
    }

    async destroy(token, ctx) {
        return await sequelize.query('DELETE FROM "sessions" WHERE token = ?', {
            replacements: token,
            type: 'DELETE'
        });
    }
}
