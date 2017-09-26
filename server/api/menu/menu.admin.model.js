'use strict';

/*eslint-env node*/

const tableName = 'menu-admin';

export default function(sequelize, DataTypes) {
  const MenuAdmin = sequelize.define('MenuAdmin', {
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    restauranteId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    }
  }, {
    freezeTableName: true,
    tableName
  });

  return MenuAdmin;
}
