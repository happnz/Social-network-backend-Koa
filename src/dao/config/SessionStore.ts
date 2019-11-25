import sequelize from "./sequelizeConfig";
import User from "../../model/User";

export default class SessionStore {
    async get(token, maxAge = 1000 * 60 * 60 * 24) {
        let id = await sequelize.query('SELECT user_id FROM "sessions" WHERE token = $1', {
            bind: [token], type: 'SELECT'
        }).then((res: any) => res[0].user_id);
        return {
            user: await User.findOne({
                where: {
                    id: id
                }
            })
        }
    }

    async set(token, session, maxAge) {
        try {
            sequelize.query('INSERT INTO "sessions" (user_id, token) VALUES ($1, $2) ' +
                'ON CONFLICT (user_id) DO UPDATE SET token = $2', {
                bind: [session.passport.user, token],
                type: 'UPSERT'
            });
        } catch (e) {}
        return token;
    }

    async destroy(token) {
        return await sequelize.query('DELETE FROM "sessions" WHERE token = ?', {
            replacements: token,
            type: 'DELETE'
        });
    }
}
