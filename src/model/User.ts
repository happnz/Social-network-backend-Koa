import {DataTypes, Model} from "sequelize";
import sequelize from "../dao/config/sequelizeConfig";

class User extends Model {
    public id!: number;
    public email!: string;
    public password!: string;
    public name!: string;
    public lastName!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// User.init({
//     id: {
//         type: new DataTypes.INTEGER.UNSIGNED,
//         autoIncrement: true,
//         primaryKey: true
//     },
//     email: {
//         type: new DataTypes.STRING(50),
//         allowNull: false,
//         unique: true,
//         validate: {
//             isEmail: true
//         }
//     },
//     password: {
//         type: new DataTypes.STRING(200),
//         allowNull: false
//     },
//     name: {
//         type: new DataTypes.STRING(50),
//         allowNull: false
//     },
//     lastName: {
//         type: new DataTypes.STRING(50),
//         allowNull: false
//     }
// }, {
//     sequelize: sequelize,
//     timestamps: true
// });

export default User;
