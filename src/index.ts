import * as Koa from "koa";

import * as logger from "koa-logger";
import * as json from "koa-json";
import authRouter from "./router/AuthRouter";

const app = new Koa();

app.use(json());
app.use(logger());

app.use(authRouter.routes());

app.listen(3000, () => {
    console.log("Koa started");
});

export default app;
