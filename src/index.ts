import * as Koa from "koa";

import * as logger from "koa-logger";
import * as json from "koa-json";
import * as session from "koa-session";
import * as bodyparser from "koa-bodyparser";
import authRouter from "./router/AuthRouter";
import userRouter from "./router/UserRouter";
import * as cors from "@koa/cors";
import * as config from "config";
import SessionStore from "./dao/config/SessionStore";
import * as passport from "koa-passport";

const app = new Koa();

if (process.env.NODE_ENV !== 'production') {
    app.use(cors({origin: 'http://localhost:4200'}))
}

app.proxy = true;
app.use(json());
app.use(logger());
app.use(bodyparser());
app.keys = ['super-secret-key']; //TODO
app.use(session({
    key: config.get('cookieName'), //TODO replace config module with TS config const
    store: new SessionStore()
}, app));
require("./config/PassportConfig");
app.use(passport.initialize());
app.use(passport.session());

app.use(authRouter.routes());
app.use(authRouter.allowedMethods());
app.use(userRouter.routes());
app.use(userRouter.allowedMethods());

export default app.listen(3000, () => {
    console.log("Koa started");
});
