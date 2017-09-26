'use strict';

/*eslint-env node*/

const tableName = 'users-history';

export default function(sequelize, DataTypes) {
  const UserHistory = sequelize.define('UserHistory', {
    _id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    userId: DataTypes.BIGINT.UNSIGNED,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    role: DataTypes.STRING,
    password: DataTypes.STRING,
    provider: DataTypes.STRING,
    salt: DataTypes.STRING,
    address1: DataTypes.STRING,
    address2: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    postalCode: DataTypes.STRING,
    editorId: DataTypes.BIGINT.UNSIGNED,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE
  }, {
    freezeTableName: true,
    tableName
  });
  return UserHistory;
}
