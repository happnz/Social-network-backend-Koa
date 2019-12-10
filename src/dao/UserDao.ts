import sequelize from "./config/sequelizeConfig";
import Post from "../model/Post";
import Pagination from "../router/utils/Pagination";
import {Op} from "sequelize";

export default class UserDao {
    static findFriendsPosts(userId: number, pagination: Pagination): Promise<Post[]> {
        return sequelize.query(`SELECT "friendId" FROM "friends" WHERE "userId" = $1`, {
            type: 'SELECT',
            bind: [userId]
        }).then(friendIds => {
            return Post.findAll({
                where: {
                    userId: {
                        [Op.in]: friendIds.map(friendId => friendId['friendId'])
                    }
                },
                order: [[pagination.sortBy, pagination.sortDirection]],
                limit: pagination.pageSize,
                offset: pagination.offset
            })
        });
    }
}
