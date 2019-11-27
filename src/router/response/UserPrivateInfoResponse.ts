export class UserPrivateInfoResponse {
    constructor(public id: number,
                public email: string,
                public password: string,
                public name: string,
                public lastName: string) {}
}
