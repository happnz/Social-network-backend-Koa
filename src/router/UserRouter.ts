import * as Router from "koa-router";
import {sessionSetterMiddleware} from "./utils/AuthUtils";
import UserService from "../service/UserService";

const router = new Router();

router.use(sessionSetterMiddleware());

router.get('/users/:id/profile', async (ctx) => {
    let id = +ctx.params.id;
    if (id === 0) {
        if (ctx.isUnauthenticated()) {
            ctx.throw('Attempted to retrieve personal info for unauthorized user');
        } else {
            id = ctx.state.user.id;
        }
    }
    ctx.body = await UserService.getUserProfileInfo(ctx.state.user, id);
});

export default router;
