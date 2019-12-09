import UserProfileForUsersResponse from "./UserProfileForUsersResponse";
import PostResponse from "./internal/PostResponse";
import FriendResponse from "./internal/FriendResponse";
import {Relation} from "./Relation";

export default class UserProfileForFriendsResponse extends UserProfileForUsersResponse {
    constructor(
        id: number,
        name: string,
        lastName: string,
        friends: FriendResponse[],
        public posts: PostResponse[]
    ) {
        super(id, name, lastName, friends);
        this.relation = Relation.FRIEND;
    }
}
