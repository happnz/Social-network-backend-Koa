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

enum FriendRequestAction {
    SEND = "SEND",
    ACCEPT = "ACCEPT",
    CANCEL = "CANCEL",
    DECLINE = "DECLINE"
}

router.post('/friendRequests', async (ctx) => {
   ctx.assert(ctx.isAuthenticated(), 401);
   const query = ctx.request.query;
   ctx.assert(query.action, 400 , 'action param must be provided');
   ctx.assert(query.userId, 400 , 'userId param must be provided');
   const otherUserId = +query.userId;
   switch (query.action) {
       case (FriendRequestAction.SEND):
           await UserService.sendFriendRequest(ctx.state.user, otherUserId);
           break;
       case (FriendRequestAction.ACCEPT):
           await UserService.acceptFriendRequest(ctx.state.user, otherUserId);
           break;
       case (FriendRequestAction.CANCEL):
           await UserService.cancelFriendRequest(ctx.state.user, otherUserId);
           break;
       case (FriendRequestAction.DECLINE):
           await UserService.declineFriendRequest(ctx.state.user, otherUserId);
           break;
       default:
           ctx.throw(400, `Unaccepted action: ${query.action}`);
           break;
   }
   ctx.body = {}
});

router.delete('/friends/:id', async (ctx) => {
    ctx.assert(ctx.isAuthenticated(), 401);
    const friendId = +ctx.params.id;
    await UserService.removeFriendRelation(ctx.state.user, friendId);
    ctx.body = {};
});

export default router;
