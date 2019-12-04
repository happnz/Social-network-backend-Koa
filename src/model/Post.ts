import {Model, BelongsToGetAssociationMixin, DataTypes, INTEGER} from "sequelize";
import User from "./User";
import sequelize from "../dao/config/sequelizeConfig";

export default class Post extends Model{
    public id!: number;
    public text!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public getUser!: BelongsToGetAssociationMixin<User>;
}

Post.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    text: {
        type: new DataTypes.STRING()
    }
}, {
    sequelize: sequelize,
    timestamps: true,
    tableName: 'posts'
});

User.hasMany(Post, {as: 'Posts', foreignKey: 'userId', sourceKey: 'id'});
Post.belongsTo(User, {as: 'Users', foreignKey: 'userId', targetKey: 'id'});
