import * as passport from "koa-passport";
import {Strategy as LocalStrategy} from "passport-local";
import User from "../model/User";
import * as bcrypt from "bcryptjs";

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// passport.deserializeUser(function(id, done) { // TODO fix workaround, make it called
//     try {
//         User.findOne({
//             where: {
//                 id: id
//             }
//         })
//             .then(user => done(null, user));
//     } catch (e) {
//         done(e);
//     }
// });

passport.use(new LocalStrategy({
    usernameField: "email",
    passwordField: "password"
}, (email, password, done) => {
    User.findOne({
        where: {
            email: email
        }})
        .then(user => {
            if (!user) {
                done(null, false);
            }
            if (bcrypt.compareSync(password, user.password)) {
                done(null, user)
            } else {
                done(null, false);
            }
        })
        .catch(err => done(err))
}));
