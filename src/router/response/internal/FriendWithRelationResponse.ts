import FriendResponse from "./FriendResponse";
import {Relation} from "../Relation";

export default class FriendWithRelationResponse extends FriendResponse {
    constructor(id: number,
                name: string,
                lastName: string,
                public relation: Relation) {
        super(id, name, lastName);
    }
}
