import {
    DataTypes,
    HasOneGetAssociationMixin,
    Model
} from "sequelize";
import sequelize from "../dao/config/sequelizeConfig";
import User from "./User";

class Friends extends Model {
    public id!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public getFriend1!: HasOneGetAssociationMixin<User>;
    public getFriend2!: HasOneGetAssociationMixin<User>;
}

Friends.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    }
}, {
    sequelize: sequelize,
    timestamps: true,
    tableName: 'friends'
});

Friends.belongsTo(User, {
    as: 'Friend1',
    onDelete: 'CASCADE',
    targetKey: 'id'
});

Friends.belongsTo(User, {
    as: 'Friend2',
    onDelete: 'CASCADE',
    targetKey: 'id'
});

export default Friends;
