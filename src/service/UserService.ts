import User from "../model/User";
import UserPrivateInfoResponse from "../router/response/UserPrivateInfoResponse";
import UserProfilePersonalResponse from "../router/response/UserProfilePersonalResponse";
import UserProfilePublicResponse from "../router/response/UserProfilePublicResponse";
import UserProfileForFriendsResponse from "../router/response/UserProfileForFriendsResponse";
import UserProfileForUsersResponse from "../router/response/UserProfileForUsersResponse";
import FriendService from "./FriendService";

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
        return User.findOne({where: { id: userIdToRetrieve }})
            .then(user => {
                if (!actor) {
                    return this.getProfilePublic(user);
                } else if (FriendService.areFriends(actor, user)) {
                    return this.getProfileForFriends(user);
                } else {
                    return this.getProfileForUsers(user);
                }
            });
    }

    static getUserPersonalProfile(user: User): UserProfilePersonalResponse {
        return new UserProfilePersonalResponse(user.id, user.name, user.lastName, [], [],[]); //TODO
    }

    private static getProfilePublic(user: User): UserProfilePublicResponse {
        return new UserProfilePublicResponse(user.id, user.name, user.lastName);
    }

    private static getProfileForUsers(user: User): UserProfileForUsersResponse {
        return new UserProfileForUsersResponse(user.id, user.name, user.lastName, []); //TODO
    }

    private static getProfileForFriends(user: User): UserProfileForFriendsResponse {
        return new UserProfileForFriendsResponse(user.id, user.name, user.lastName, [], []); //TODO
    }

}
