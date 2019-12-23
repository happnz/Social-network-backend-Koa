import User from "../model/User";
import UserPrivateInfoResponse from "../router/response/UserPrivateInfoResponse";
import UserProfilePersonalResponse from "../router/response/UserProfilePersonalResponse";
import UserProfilePublicResponse from "../router/response/UserProfilePublicResponse";
import UserProfileForFriendsResponse from "../router/response/UserProfileForFriendsResponse";
import UserProfileForUsersResponse from "../router/response/UserProfileForUsersResponse";
import FriendService from "./FriendService";
import FriendResponse from "../router/response/internal/FriendResponse";
import NotFoundError from "../error/NotFoundError";
import ServiceError from "../error/ServiceError";
import Post from "../model/Post";
import PostResponse from "../router/response/internal/PostResponse";
import sequelize from "../dao/config/sequelizeConfig";
import UserDao from "../dao/UserDao";
import Pagination from "../router/utils/Pagination";
import PostWithAuthorResponse from "../router/response/internal/PostWithAuthorResponse";
import UserSearchQuery from "../router/query/UserSearchQuery";
import PaginationResponse from "../router/response/PaginationResponse";
import FriendSearchQuery from "../router/query/FriendSearchQuery";
import FriendWithRelationResponse from "../router/response/internal/FriendWithRelationResponse";

export default class UserService {
    static async saveUser(userDto): Promise<UserPrivateInfoResponse> {
        return User.create({
            name: userDto.name,
            lastName: userDto.lastName,
            email: userDto.email,
            password: userDto.password,
        })
            .then(user =>
                new UserPrivateInfoResponse(user.id, user.email, user.password, user.name, user.lastName));
    }

    static async getUserProfileInfo(actor: User | null, userIdToRetrieve: number): Promise<UserProfilePublicResponse | UserProfileForFriendsResponse | UserProfileForUsersResponse> {
        if (actor && actor.id === userIdToRetrieve) {
            return this.getUserPersonalProfile(actor);
        }

        return User.findOne({where: { id: userIdToRetrieve }})
            .then(user => {
                if (!user) {
                    throw new NotFoundError('User not found');
                }

                if (!actor) {
                    return this.getProfilePublic(user);
                } else {
                    return FriendService.areFriends(actor, user)
                        .then(areFriends => areFriends ? this.getProfileForFriends(user) : this.getProfileForUsers(user));
                }
            });
    }

    static async sendFriendRequest(actor: User, toId: number): Promise<void> {
        const to = await this.findUserByIdOrThrow(toId);
        this.assertFriendIdIsDifferent(actor.id, toId);

        if (await FriendService.areFriends(actor, to)) {
            throw new ServiceError('You are already friends with this user', 400);
        } else if (await to.hasIncomingFriendRequest(actor)) {
            throw new ServiceError('You already sent friend request to this user', 400);
        } else {
            return FriendService.createFriendRequest(actor, to);
        }
    }

    static async cancelFriendRequest(actor: User, toId: number): Promise<void> {
        const to = await this.findUserByIdOrThrow(toId);
        this.assertFriendIdIsDifferent(actor.id, toId);

        if (! await to.hasIncomingFriendRequest(actor)) {
            throw new ServiceError('You have not sent request to that user', 400);
        } else {
            return FriendService.removeFriendRequest(actor, to);
        }
    }

    static async acceptFriendRequest(actor: User, fromId: number): Promise<void> {
        sequelize.transaction(async (t) => {
            const from = await this.findUserByIdOrThrow(fromId);
            this.assertFriendIdIsDifferent(actor.id, fromId);

            if (!await actor.hasIncomingFriendRequest(from)) {
                throw new ServiceError('Friend request from this user does not exist', 400);
            }

            await FriendService.createFriendRelation(actor, from);
            await FriendService.removeFriendRequest(from, actor);
        });
    }

    static async declineFriendRequest(actor: User, fromId: number): Promise<void> {
        const from = await this.findUserByIdOrThrow(fromId);
        this.assertFriendIdIsDifferent(actor.id, fromId);

        if (! await actor.hasIncomingFriendRequest(from)) {
            throw new ServiceError('You do not have friend request from this user', 400);
        }

        return FriendService.removeFriendRequest(from, actor);
    }

    static async removeFriendRelation(actor: User, friendId: number): Promise<void> {
        const friend = await this.findUserByIdOrThrow(friendId);
        this.assertFriendIdIsDifferent(actor.id, friendId);

        if (! await FriendService.areFriends(actor, friend)) {
            throw new ServiceError('You are not friends with this user', 400);
        }

        return FriendService.removeFriendRelation(actor, friend);
    }


    static async createNewPost(user: User, requestBody): Promise<PostResponse> {
        return user.createPost({
            text: requestBody.text
        })
            .then(post => {
                return new PostResponse(post.id, post.text, post.createdAt, post.updatedAt);
            });
    }

    static async updatePost(user: User, postId: number, requestBody): Promise<PostResponse> {
        return Post.findOne({ where: { id: postId}})
            .then(post => {
                if (!post || !user.hasPost(post)) {
                    throw new ServiceError('You are not the author of this post', 400);
                }

                return post.update({ text: requestBody.text})
                    .then(updatedPost =>
                        new PostResponse(updatedPost.id, updatedPost.text, updatedPost.createdAt, updatedPost.updatedAt));
            });
    }

    static async deletePost(user: User, postId: number): Promise<void> {
        if (! await user.hasPost(postId)) {
            throw new ServiceError('You are not the author of this post', 400);
        }

        return user.removePost(postId);
    }

    static async getFriendsNews(user: User, pageSize: number, pageNumber: number): Promise<PostWithAuthorResponse[]> {
        let response: PostWithAuthorResponse[] = [];

        let posts = await UserDao.findFriendsPosts(user.id, new Pagination(
            pageSize,
            pageNumber,
            'createdAt',
            'DESC'));

        for (const post of posts) {
            const user = await post.getUser();
            response.push(new PostWithAuthorResponse(post.id, post.text, post.createdAt, post.updatedAt, new FriendResponse(user.id, user.name, user.lastName)));
        }

        return response;
    }

    static async searchUsers(actor: User, pagination: Pagination, userSearchQuery: UserSearchQuery): Promise<PaginationResponse<FriendWithRelationResponse>> {
        return UserDao.findUsers(userSearchQuery, pagination)
            .then(res => {
                return Promise.all(res.rows.map(async (user) => {
                    const relation = await FriendService.getRelationType(actor, user);
                    return new FriendWithRelationResponse(user.id, user.name, user.lastName, relation);
                })).then(data => {
                        return PaginationResponse.from(
                            data,
                            pagination.pageNumber,
                            pagination.pageSize,
                            res.count
                        )
                    })

            });
    }

    static async searchFriends(actor: User, pagination: Pagination, friendSearchQuery: FriendSearchQuery): Promise<PaginationResponse<FriendWithRelationResponse>> {
        const user = await this.findUserByIdOrThrow(friendSearchQuery.userId);
        return UserDao.findFriends(user, friendSearchQuery, pagination)
            .then(res => {
                return Promise.all(res.rows.map(async (user) => {
                    const relation = await FriendService.getRelationType(actor, user);
                    return new FriendWithRelationResponse(user.id, user.name, user.lastName, relation);
                }))
                    .then(data => {
                        return PaginationResponse.from(
                            data,
                            pagination.pageNumber,
                            pagination.pageSize,
                            res.count
                        )
                    })
            });
    }

    private static assertFriendIdIsDifferent(actorId: number, friendId: number) {
        if (actorId === friendId) {
            throw new ServiceError('Friend requests to oneself are prohibited', 400);
        }
    }

    private static async findUserByIdOrThrow(id: number): Promise<User> {
        const user = await User.findOne({where: {id: id}});
        if (!user) {
            throw new NotFoundError('User not found');
        }

        return user;
    }

    private static async getUserPersonalProfile(user: User): Promise<UserProfilePersonalResponse> {
        let userProfilePersonalResponse = new UserProfilePersonalResponse(user.id, user.name, user.lastName, [], [], []);
        const friendsPromise = user.getFriends()
            .then(friends => {
                userProfilePersonalResponse.friends = friends.map(friend => new FriendResponse(friend.id, friend.name, friend.lastName));
            });

        const friendRequestsPromise = user.getIncomingFriendRequests()
            .then(friendRequests => {
                userProfilePersonalResponse.friendRequests = friendRequests.map(friendRequest =>
                    new FriendResponse(friendRequest.id, friendRequest.name, friendRequest.lastName));
            });

        const postsPromise = user.getPosts({
            order: [['createdAt', 'DESC']]
        })
            .then(posts => {
                userProfilePersonalResponse.posts = posts
                    .map(post => new PostResponse(post.id, post.text, post.createdAt, post.updatedAt));
            });

        return Promise.all([friendsPromise, friendRequestsPromise, postsPromise])
            .then(() => userProfilePersonalResponse);
    }

    private static async getProfilePublic(user: User): Promise<UserProfilePublicResponse> {
        return new UserProfilePublicResponse(user.id, user.name, user.lastName);
    }

    private static async getProfileForUsers(user: User): Promise<UserProfileForUsersResponse> {
        return user.getFriends()
            .then(friends =>
                friends.map(friend =>
                    new FriendResponse(friend.id, friend.name, friend.lastName)))
            .then(friendsDto => new UserProfileForUsersResponse(user.id, user.name, user.lastName, friendsDto));
    }

    private static async getProfileForFriends(user: User): Promise<UserProfileForFriendsResponse> {
        let userProfileForFriendsResponse = new UserProfileForFriendsResponse(user.id, user.name, user.lastName, [], []);
        const friendsPromise = user.getFriends()
            .then(friends => {
                userProfileForFriendsResponse.friends = friends.map(friend => new FriendResponse(friend.id, friend.name, friend.lastName));
            });

        const postsPromise = user.getPosts({
            order: [['createdAt', 'DESC']]
        })
            .then(posts => {
                userProfileForFriendsResponse.posts = posts
                    .map(post => new PostResponse(post.id, post.text, post.createdAt, post.updatedAt))
            });

        return Promise.all([friendsPromise, postsPromise])
            .then(() => userProfileForFriendsResponse);
    }

}
