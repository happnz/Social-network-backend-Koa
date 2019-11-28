import User from "../model/User";

export default class FriendService {
    static async createFriendRelation(user1: User, user2: User): Promise<void> {
        return user1.addFriend(user2)
            .then(_ => user2.addFriend(user1));
    }

    static async removeFriendRelation(user1: User, user2: User): Promise<void> {
        return user1.removeFriend(user2)
            .then(_ => user2.removeFriend(user1));
    }

    static async friendRequest(from: User, to: User): Promise<void> {
        return to.addIncomingFriendRequest(from);
    }

    static async areFriends(user1: User, user2: User): Promise<boolean> {
        return user1.hasFriend(user2)
            .then(res1 => user2.hasFriend(user1)
                .then(res2 => res1 && res2));
    }
}
