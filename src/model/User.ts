import {
    Association,
    DataTypes,
    HasManyAddAssociationMixin, HasManyCountAssociationsMixin,
    HasManyGetAssociationsMixin,
    HasManyHasAssociationMixin, HasManyRemoveAssociationMixin,
    Model
} from "sequelize";
import sequelize from "../dao/config/sequelizeConfig";

class User extends Model {
    public id!: number;
    public email!: string;
    public password!: string;
    public name!: string;
    public lastName!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public getFriends!: HasManyGetAssociationsMixin<User>;
    public addFriend!: HasManyAddAssociationMixin<User, number>;
    public removeFriend!: HasManyRemoveAssociationMixin<User, number>;
    public hasFriend!: HasManyHasAssociationMixin<User, number>;
    public countFriends!: HasManyCountAssociationsMixin;

    public getIncomingFriendRequests!: HasManyGetAssociationsMixin<User>;
    public addIncomingFriendRequest!: HasManyAddAssociationMixin<User, number>;
    public hasIncomingFriendRequest!: HasManyHasAssociationMixin<User, number>;
    public removeIncomingFriendRequest!: HasManyRemoveAssociationMixin<User, number>;
    public countIncomingFriendRequests!: HasManyCountAssociationsMixin;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: new DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    password: {
        type: new DataTypes.STRING(200),
        allowNull: false
    },
    name: {
        type: new DataTypes.STRING(50),
        allowNull: false
    },
    lastName: {
        type: new DataTypes.STRING(50),
        allowNull: false
    }
}, {
    sequelize: sequelize,
    timestamps: true,
    tableName: 'users'
});

User.belongsToMany(User, {
    as: 'Friends',
    through: 'friends',
    foreignKey: 'userId',
    otherKey: 'friendId'
});

User.belongsToMany(User, {
    as: 'IncomingFriendRequests',
    through: 'friendRequests',
    foreignKey: 'toId',
    otherKey: 'fromId'
});

export default User;
