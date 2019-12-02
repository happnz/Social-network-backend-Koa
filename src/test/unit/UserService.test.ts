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
import ServiceError from "../../error/ServiceError";

describe('UserService', () => {
   const userToRetrieve1 = {
      id: 2,
      email: "email2@email.com",
      password: "123456",
      name: "Jack",
      lastName: "Jackson",
      async getFriends() {
         return [userToRetrieve2];
      },
      async hasIncomingFriendRequest(user: User) {
         return true;
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
      },
      async hasIncomingFriendRequest(user: User) {
         return true;
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

   describe('#sendFriendRequest()', () => {
      beforeEach(() => {
         sinon.restore();
      });

      it('should throw ServiceError if sent to user with the same id', async () => {
         sinon.stub(UserService, 'findUserByIdOrThrow')
             .withArgs(1)
             .resolves(actor);

         try {
            await UserService.sendFriendRequest(actor, 1);
         } catch (e) {
            expect(e).to.be.instanceOf(ServiceError);
            expect(e.message).to.equal('Friend requests to oneself are prohibited');
            expect(e.status).to.equal(400);
         }
      });

      it('should throw ServiceError if are already friends', async () => {
         sinon.stub(FriendService, 'areFriends')
             .resolves(true);

         sinon.stub(UserService, 'findUserByIdOrThrow')
             .withArgs(2)
             .resolves(userToRetrieve1);

         try {
            await UserService.sendFriendRequest(actor, 2);
         } catch (e) {
            expect(e).to.be.instanceOf(ServiceError);
            expect(e.message).to.equal('You are already friends with this user');
            expect(e.status).to.equal(400);
         }
      });

      it('should throw ServiceError if already sent to this user', async () => {
         sinon.stub(FriendService, 'areFriends')
             .resolves(false);

         sinon.stub(userToRetrieve1, 'hasIncomingFriendRequest')
             .resolves(true);

         sinon.stub(UserService, 'findUserByIdOrThrow')
             .withArgs(2)
             .resolves(userToRetrieve1);

         try {
            await UserService.sendFriendRequest(actor, 2);
         } catch (e) {
            expect(e).to.be.instanceOf(ServiceError);
            expect(e.message).to.equal('You already sent friend request to this user');
            expect(e.status).to.equal(400);
         }
      });


      it('should succeed', async () => {
         sinon.stub(FriendService, 'areFriends')
             .resolves(false);

         sinon.stub(userToRetrieve1, 'hasIncomingFriendRequest')
             .resolves(false);

         sinon.stub(UserService, 'findUserByIdOrThrow')
             .withArgs(2)
             .resolves(userToRetrieve1);

         sinon.stub(FriendService, 'createFriendRequest')
             .withArgs(actor, userToRetrieve1)
             .resolves(undefined);

         await UserService.sendFriendRequest(actor, 2);
      });
   });

   describe('#cancelFriendRequest()', () => {
      beforeEach(() => {
         sinon.restore();
      });

      it('should throw ServiceError if not sent to this user', async () => {
         sinon.stub(FriendService, 'areFriends')
             .resolves(false);

         sinon.stub(userToRetrieve1, 'hasIncomingFriendRequest')
             .resolves(false);

         sinon.stub(UserService, 'findUserByIdOrThrow')
             .withArgs(2)
             .resolves(userToRetrieve1);

         try {
            await UserService.cancelFriendRequest(actor, 2);
         } catch (e) {
            expect(e).to.be.instanceOf(ServiceError);
            expect(e.message).to.equal('You have not sent request to that user');
            expect(e.status).to.equal(400);
         }
      });


      it('should succeed', async () => {
         sinon.stub(FriendService, 'areFriends')
             .resolves(false);

         sinon.stub(userToRetrieve1, 'hasIncomingFriendRequest')
             .resolves(true);

         sinon.stub(UserService, 'findUserByIdOrThrow')
             .withArgs(2)
             .resolves(userToRetrieve1);

         sinon.stub(FriendService, 'removeFriendRequest')
             .withArgs(actor, userToRetrieve1)
             .resolves(undefined);

         await UserService.cancelFriendRequest(actor, 2);
      });
   });

});
