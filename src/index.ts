import * as Koa from "koa";

import * as logger from "koa-logger";
import * as json from "koa-json";
import * as bodyparser from "koa-bodyparser"
import authRouter from "./router/AuthRouter";
import * as cors from "@koa/cors";

const app = new Koa();

if (process.env.NODE_ENV !== 'production') {
    app.use(cors({origin: 'http://localhost:4200'}))
}

app.use(json());
app.use(logger());
app.use(bodyparser());

app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

app.listen(3000, () => {
    console.log("Koa started");
});

export default app;
