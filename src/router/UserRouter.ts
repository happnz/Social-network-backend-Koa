import * as Router from "koa-router";
import {sessionSetterMiddleware} from "./utils/AuthUtils";
import UserService from "../service/UserService";

const router = new Router();

router.use(sessionSetterMiddleware());

router.post('/users/:id/profile', async (ctx) => {
    const id = +ctx.params.id;
    if (id === 0) {
        if (ctx.isUnauthenticated()) {
            ctx.throw('Attempted to retrieve personal info for unauthorized user');
        } else {
            UserService.getUserPersonalProfile(ctx.state.user);
        }
    } else {
        ctx.body = await UserService.getUserProfileInfo(ctx.state.user, id);
    }
});
