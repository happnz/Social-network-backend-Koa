import * as Router from "koa-router";
import {validate} from "./validator/SchemaValidator";
import * as signUpSchema from "./validator/UserSignUpSchema";
import User from "../model/User";

const router = new Router();

router.post("/sign-up", async (ctx) => {
    const errors = validate(signUpSchema, ctx.request.body); //TODO middleware
    if (Array.isArray(errors) && errors.length > 0) {
        ctx.response.code = 400;
        ctx.response.body = errors;
    }

    const savedUser = await User.create(ctx.request.body);
    ctx.body = savedUser;
    ctx.login();
});

export default router;
