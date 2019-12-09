import sequelize from "./config/sequelizeConfig";
import Post from "../model/Post";
import Pagination from "../router/utils/Pagination";

export default class UserDao {
    static findFriendsPosts(userId: number, pagination: Pagination): Promise<Post[]> {
        return sequelize.query(`SELECT post.id, post.text, post."userId", post."createdAt" as "createdAt"
            FROM posts post WHERE "userId" IN 
            ( SELECT "friendId" FROM friends f where f."userId" = $1 )
            ORDER BY "${pagination.sortBy}" ${pagination.sortDirection}
            LIMIT ${pagination.limit}
            OFFSET ${pagination.offset}`, {
            type: 'SELECT',
            bind : [userId],
            model: Post,
            mapToModel: true,
        });
    }
}
