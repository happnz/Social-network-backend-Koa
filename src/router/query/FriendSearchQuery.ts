import UserSearchQuery from "./UserSearchQuery";

export default interface FriendSearchQuery extends UserSearchQuery {
    userId?: number;
}
