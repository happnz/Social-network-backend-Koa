import User from "../model/User";
import UserPrivateInfoResponse from "../router/response/UserPrivateInfoResponse";
import UserProfilePersonalResponse from "../router/response/UserProfilePersonalResponse";
import UserProfilePublicResponse from "../router/response/UserProfilePublicResponse";
import UserProfileForFriendsResponse from "../router/response/UserProfileForFriendsResponse";
import UserProfileForUsersResponse from "../router/response/UserProfileForUsersResponse";
import FriendService from "./FriendService";
import FriendResponse from "../router/response/internal/FriendResponse";
import NotFoundError from "../error/NotFoundError";

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

    private static async getUserPersonalProfile(user: User): Promise<UserProfilePersonalResponse> {
        let userProfilePersonalResponse = new UserProfilePersonalResponse(user.id, user.name, user.lastName, [], [], []); //TODO posts
        const friendsPromise = user.getFriends()
            .then(friends => {
                userProfilePersonalResponse.friends = friends.map(friend => new FriendResponse(friend.id, friend.name, friend.lastName));
            });

        const friendRequestsPromise = user.getIncomingFriendRequests()
            .then(friendRequests => {
                userProfilePersonalResponse.friendRequests = friendRequests.map(friendRequest =>
                    new FriendResponse(friendRequest.id, friendRequest.name, friendRequest.lastName));
            });

        return Promise.all([friendsPromise, friendRequestsPromise])
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
        return user.getFriends()
            .then(friends =>
                friends.map(friend =>
                    new FriendResponse(friend.id, friend.name, friend.lastName)))
            .then(friendsDto => new UserProfileForFriendsResponse(user.id, user.name, user.lastName, friendsDto, [])); //TODO posts
    }

}
