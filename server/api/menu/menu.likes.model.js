'use strict';

/*eslint-env node*/

const tableName = 'menu-likes';

export default function(sequelize, DataTypes) {
  const MenuLikes = sequelize.define('MenuLikes', {
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

  return MenuLikes;
}
