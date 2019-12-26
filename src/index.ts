import * as Koa from "koa";

import * as logger from "koa-logger";
import * as json from "koa-json";
import * as session from "koa-session";
import * as bodyparser from "koa-bodyparser";
import healthCheckRouter from "./router/HealthCheckRouter";
import authRouter from "./router/AuthRouter";
import userRouter from "./router/UserRouter";
import * as cors from "@koa/cors";
import * as config from "config";
import SessionStore from "./dao/config/SessionStore";
import * as passport from "koa-passport";
import {Sequelize} from "sequelize";

const app = new Koa();

app.use(cors({origin: config.get('corsUrl'), credentials: true}));

app.use(logger());
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.status || 500;
        if (ctx.status >= 500) {
            ctx.app.emit('error', err, ctx);
            ctx.body = 'Internal server error';
        } else {
            ctx.body = err.message;
        }
    }
});

const cls = require('cls-hooked');
const namespace = cls.createNamespace('transaction-namespace');
Sequelize.useCLS(namespace);

app.proxy = true;
app.use(json());
app.use(bodyparser());
app.keys = ['super-secret-key']; //TODO
app.use(session({
    key: config.get('cookieName'), //TODO replace config module with TS config const
    store: new SessionStore()
}, app));
require("./config/PassportConfig");
app.use(passport.initialize());
app.use(passport.session());

app.use(healthCheckRouter.routes());
app.use(authRouter.routes());
app.use(authRouter.allowedMethods());
app.use(userRouter.routes());
app.use(userRouter.allowedMethods());

export default app.listen(process.env.PORT || 3000, () => {
    console.log("Koa started");
});
