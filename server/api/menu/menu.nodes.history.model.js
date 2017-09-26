'use strict';

/*eslint-env node*/

const tableName = 'menu-nodes-history';

export default function(sequelize, DataTypes) {
  const MenuNodesHistory = sequelize.define('MenuNodesHistory', {
    _id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    nodeId: DataTypes.BIGINT.UNSIGNED,
    name: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    authorId: DataTypes.BIGINT.UNSIGNED,
    editorId: DataTypes.BIGINT.UNSIGNED,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE
  }, {
    freezeTableName: true,
    tableName
  });

  return MenuNodesHistory;
}
