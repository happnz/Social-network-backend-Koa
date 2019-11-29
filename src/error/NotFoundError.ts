import ServiceError from "./ServiceError";

export default class NotFoundError extends ServiceError {
    constructor(message: string) {
        super(message, 404);
    }
}
