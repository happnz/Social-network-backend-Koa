import User from "../model/User";
import {Relation} from "../router/response/Relation";

export default class FriendService {
    static async createFriendRelation(user1: User, user2: User): Promise<void> {
        return user1.addFriend(user2)
            .then(_ => user2.addFriend(user1));
    }

    static async removeFriendRelation(user1: User, user2: User): Promise<void> {
        return user1.removeFriend(user2)
            .then(_ => user2.removeFriend(user1));
    }

    static async createFriendRequest(from: User, to: User): Promise<void> {
        return to.addIncomingFriendRequest(from);
    }

    static async removeFriendRequest(from: User, to: User): Promise<void> {
        return to.removeIncomingFriendRequest(from);
    }

    static async areFriends(user1: User, user2: User): Promise<boolean> {
        return user1.hasFriend(user2)
            .then(res1 => user2.hasFriend(user1)
                .then(res2 => res1 && res2));
    }

    static async getRelationType(actor: User, user2: User): Promise<Relation> {
        if (await actor.hasFriend(user2)) {
            return Relation.FRIEND;
        } else if (actor.id === user2.id) {
            return Relation.PERSONAL;
        } else {
            return Relation.USER;
        }
    }
}
