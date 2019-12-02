export default class PostResponse {
    public updatedAt: Date;

    constructor(
        public id: number,
        public text: string,
        public createdAt: Date,
        updatedAt: Date
    ) {
        if (createdAt === updatedAt) {
            this.updatedAt = null;
        }
    }
}
