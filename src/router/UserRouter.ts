import * as Router from "koa-router";
import {sessionSetterMiddleware} from "./utils/AuthUtils";
import UserService from "../service/UserService";
import {parsePaginationQuery, validateSchema, validationMiddleware} from "./validator/SchemaValidator";
import postValidator from './validator/PostValidator';
import FriendSearchQuery from "./query/FriendSearchQuery";
import UserSearchQuery from "./query/UserSearchQuery";

const router = new Router();

router.use(sessionSetterMiddleware());

router.get('/users/:id/profile', async (ctx) => {
    let id = +ctx.params.id;
    if (id === 0) {
        if (ctx.isUnauthenticated()) {
            ctx.throw(401, 'Attempted to retrieve personal info for unauthorized user');
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

router.post('/posts', validationMiddleware(postValidator), async (ctx) => {
    ctx.assert(ctx.isAuthenticated(), 401);
    ctx.body = await UserService.createNewPost(ctx.state.user, ctx.request.body);
});

router.put('/posts/:id', validationMiddleware(postValidator), async (ctx) => {
    ctx.assert(ctx.isAuthenticated(), 401);
    ctx.assert(ctx.params.id, 400, 'id must be provided');
    const postId = +ctx.params.id;
    await UserService.updatePost(ctx.state.user, postId, ctx.request.body);
    ctx.body = {};
});

router.delete('/posts/:id', async (ctx) => {
    ctx.assert(ctx.isAuthenticated(), 401);
    ctx.assert(ctx.params.id, 400, 'id must be provided');
    const postId = +ctx.params.id;
    await UserService.deletePost(ctx.state.user, postId);
    ctx.body = {};
});

router.get('/news', async (ctx) => {
    ctx.assert(ctx.isAuthenticated(), 401);
    const paginationQuery = ctx.request.query;
    const pagination = parsePaginationQuery(paginationQuery, []);
    ctx.body = await UserService.getFriendsNews(ctx.state.user, pagination.pageSize, pagination.pageNumber);
});

router.get('/users/search', async (ctx) => {
    ctx.assert(ctx.isAuthenticated(), 401);
    const paginationQuery = ctx.request.query;
    const pagination = parsePaginationQuery(paginationQuery, []);
    const userSearchQuery: UserSearchQuery = ctx.request.query;
    ctx.body = await UserService.searchUsers(ctx.state.user, pagination, userSearchQuery);
});

router.get('/friends', async (ctx) => {
    ctx.assert(ctx.isAuthenticated(), 401);
    const paginationQuery = ctx.request.query;
    const pagination = parsePaginationQuery(paginationQuery, []);
    const friendSearchQuery: FriendSearchQuery = ctx.request.query;
    if (isNaN(friendSearchQuery.userId)) {
        friendSearchQuery.userId = ctx.state.user.id;
    }
    ctx.body = await UserService.searchFriends(ctx.state.user, pagination, friendSearchQuery);
});


export default router;
