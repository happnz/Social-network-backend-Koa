import * as Router from "koa-router";
import {validate} from "./validator/SchemaValidator";
import * as signUpSchema from "./validator/UserSignUpSchema";
import User from "../model/User";
import * as passport from "koa-passport";

const router = new Router();

router.post("/sign-up", async (ctx) => {
    const errors = validate(signUpSchema, ctx.request.body); //TODO middleware
    if (Array.isArray(errors) && errors.length > 0) {
        ctx.response.code = 400;
        ctx.response.body = errors;
    }

    const savedUser = await User.create(ctx.request.body);
    ctx.body = savedUser;
    //TODO sign-in
});

router.post("/sign-in", async (ctx) => {
    return passport.authenticate('local', function(err, user, info, status) {
        if (user === false) {
            ctx.throw(401)
        } else {
            ctx.body = {};
            return ctx.login(user)
        }
    })(ctx);
});


router.use(async (ctx, next) => { //TODO fix workaround
    if (ctx.session && ctx.session.user) {
        ctx.state.user = ctx.session.user;
        ctx.session.user = null;
    }
    next();
});

router.post("/sign-out", async (ctx) => {
    if (ctx.isAuthenticated()) {
        ctx.logout();
        ctx.body = {};
    } else {
        ctx.throw(401);
    }
});

export default router;
