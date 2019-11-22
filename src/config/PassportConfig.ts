import * as passport from "koa-passport";
import User from "../model/User";

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    const user = User.findOne({
        where: {
            id: id
        }});
    done(null, user);
});

export default passport;
