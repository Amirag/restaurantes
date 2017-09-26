'use strict';

const tableName = 'menu-paths';

export default function(sequelize, DataTypes) {
  const MenuPaths = sequelize.define('MenuPaths', {
    parent: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    descendant: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    depth: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    freezeTableName: true,
    tableName
  });

  return MenuPaths;
}
