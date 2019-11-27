import UserProfileForUsersResponse from "./UserProfileForUsersResponse";
import PostResponse from "./internal/PostResponse";
import FriendResponse from "./internal/FriendResponse";

export default class UserProfileForFriendsResponse extends UserProfileForUsersResponse {
    constructor(
        id: number,
        name: string,
        lastName: string,
        friends: FriendResponse[],
        public posts: PostResponse[]
    ) {
        super(id, name, lastName, friends);
    }
}
