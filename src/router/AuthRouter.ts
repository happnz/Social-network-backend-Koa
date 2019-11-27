import * as Router from "koa-router";
import {validationMiddleware} from "./validator/SchemaValidator";
import signUpSchema from "./validator/UserSignUpSchema";
import * as passport from "koa-passport";
import UserService from "../service/UserService";

const router = new Router();

router.use(async (ctx, next) => { //TODO fix workaround
    if (ctx.session && ctx.session.user) {
        ctx.state.user = ctx.session.user;
        ctx.session.user = null;
    }
    await next();
});

router.post("/sign-up", validationMiddleware(signUpSchema), async (ctx) => {
    ctx.assert(ctx.isUnauthenticated(), 401);
    const savedUser = await UserService.saveUser(ctx.request.body);
    await ctx.login(savedUser);
    ctx.body = savedUser;
});

router.post("/sign-in", async (ctx) => {
    return passport.authenticate('local', function(err, user, info, status) {
        ctx.assert(user, 401);
        ctx.body = {};
        return ctx.login(user)
    })(ctx);
});

router.post("/sign-out", async (ctx) => {
    ctx.assert(ctx.isAuthenticated(), 401);
    signOut(ctx);
    ctx.body = {};
});

function signOut(ctx) {
    ctx.logout();
    ctx.session = null;
}

export default router;
