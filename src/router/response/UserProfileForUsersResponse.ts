import FriendResponse from "./internal/FriendResponse";
import UserProfilePublicResponse from "./UserProfilePublicResponse";
import {Relation} from "./Relation";

export default class UserProfileForUsersResponse extends UserProfilePublicResponse {
    public relation: string;

    constructor(
        id: number,
        name: string,
        lastName: string,
        public friends: FriendResponse[]
    ) {
        super(id, name, lastName);
        this.relation = Relation.USER;
    }
}
