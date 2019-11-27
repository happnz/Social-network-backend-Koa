import FriendResponse from "./internal/FriendResponse";
import UserProfilePublicResponse from "./UserProfilePublicResponse";
import PostResponse from "./internal/PostResponse";

export default class UserProfileForUsersResponse extends UserProfilePublicResponse {
    constructor(
        id: number,
        name: string,
        lastName: string,
        public friends: FriendResponse[]
    ) {
        super(id, name, lastName);
    }
}
