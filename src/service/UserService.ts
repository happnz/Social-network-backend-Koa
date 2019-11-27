import User from "../model/User";
import {UserPrivateInfoResponse} from "../router/response/UserPrivateInfoResponse";

export default class UserService {
    static async saveUser(userDto): Promise<UserPrivateInfoResponse> {
        return User.create({
            name: userDto.name,
            lastName: userDto.lastName,
            email: userDto.email,
            password: userDto.password,
        })
            .then(user =>
                new UserPrivateInfoResponse(user.id, user.email, user.password, user.name, user.lastName));
    }
}
