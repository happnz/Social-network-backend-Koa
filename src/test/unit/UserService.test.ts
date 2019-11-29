import User from "../../model/User";

process.env.NODE_ENV = 'test';

import "mocha";
import {expect} from "chai";
import * as sinon from "sinon";
import UserService from "../../service/UserService";
import FriendService from "../../service/FriendService";
import UserProfileForFriendsResponse from "../../router/response/UserProfileForFriendsResponse";
import FriendResponse from "../../router/response/internal/FriendResponse";
import UserProfileForUsersResponse from "../../router/response/UserProfileForUsersResponse";
import UserProfilePublicResponse from "../../router/response/UserProfilePublicResponse";
import UserProfilePersonalResponse from "../../router/response/UserProfilePersonalResponse";
import NotFoundError from "../../error/NotFoundError";

describe('UserService', () => {
   const userToRetrieve1 = {
      id: 2,
      email: "email2@email.com",
      password: "123456",
      name: "Jack",
      lastName: "Jackson",
      async getFriends() {
         return [userToRetrieve2];
      }
   } as User;

   const userToRetrieve2 = {
      id: 3,
      email: "email3@email.com",
      password: "123456",
      name: "Bob",
      lastName: "Bobby"
   } as User;

   const actor = {
      id: 1,
      email: "email@email.com",
      password: "123456",
      name: "John",
      lastName: "Johnson",
      async getFriends() {
         return [userToRetrieve2];
      },
      async getIncomingFriendRequests() {
         return [userToRetrieve1]
      }
   } as User;

   const testUserMap = new Map();
   [actor, userToRetrieve1, userToRetrieve2].forEach(user => {
      testUserMap.set(user.id, user);
   });


   describe('#getUserProfileInfo()', () => {
      let areFriendsStub;
      beforeEach(() => {
         sinon.restore();
         sinon.stub(User, 'findOne').callsFake(async (arg) => testUserMap.get(arg.where.id));
      });

      it('should return UserProfileForFriendsResponse if FriendService.areFriends is true', async () => {
         areFriendsStub = sinon.stub(FriendService, 'areFriends')
             .withArgs(actor, userToRetrieve1).resolves(true);

         const res = await UserService.getUserProfileInfo(actor, userToRetrieve1.id);

         expect(res).to.deep.equal(new UserProfileForFriendsResponse(2, "Jack", "Jackson",
             [new FriendResponse(3, "Bob", "Bobby")], [])); //TODO posts
      });

      it('should return UserProfileForUsersResponse if FriendService.areFriends is false', async () => {
         areFriendsStub = sinon.stub(FriendService, 'areFriends')
             .withArgs(actor, userToRetrieve1).resolves(false);

         const res = await UserService.getUserProfileInfo(actor, userToRetrieve1.id);

         expect(res).to.deep.equal(new UserProfileForUsersResponse(2, "Jack", "Jackson",
             [new FriendResponse(3, "Bob", "Bobby")]));
      });

      it('should return UserProfilePublicResponse if actor is null', async () => {
         const res = await UserService.getUserProfileInfo(null, userToRetrieve1.id);

         expect(res).to.deep.equal(new UserProfilePublicResponse(2, "Jack", "Jackson"));
      });

      it('should return UserProfilePersonalResponse if actor.id === userToRetrieveId', async () => {
         const res = await UserService.getUserProfileInfo(actor, actor.id);

         expect(res).to.deep.equal(new UserProfilePersonalResponse(1, "John", "Johnson",
             [new FriendResponse(3, "Bob", "Bobby")], [], //TODO posts
             [new FriendResponse(2, "Jack", "Jackson")]));
      });

       it('should throw NotFoundError if id user with userToRetrieveId does not exist', async () => {
           try {
               const res = await UserService.getUserProfileInfo(actor, 1000);
           } catch (e) {
               expect(e).to.be.instanceOf(NotFoundError);
           }
       });
   });
});
