import * as Router from "koa-router";
import {validateSchema, validationMiddleware} from "./validator/SchemaValidator";
import signUpSchema from "./validator/UserSignUpSchema";
import User from "../model/User";
import * as passport from "koa-passport";

const router = new Router();

router.use(async (ctx, next) => { //TODO fix workaround
    if (ctx.session && ctx.session.user) {
        ctx.state.user = ctx.session.user;
        ctx.session.user = null;
    }
    await next();
});

router.post("/sign-up", validationMiddleware(signUpSchema), async (ctx) => {
    if (ctx.isAuthenticated()) {
        ctx.throw(400);
    }
    const savedUser = await User.create(ctx.request.body);
    await ctx.login(savedUser);
    ctx.body = savedUser;
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

router.post("/sign-out", async (ctx) => {
    if (ctx.isAuthenticated()) {
        signOut(ctx);
        ctx.body = {};
    } else {
        ctx.throw(401);
    }
});

function signOut(ctx) {
    ctx.logout();
    ctx.session = null;
}

export default router;
