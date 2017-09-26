'use strict';

/*eslint-env node*/

const tableName = 'platillos-history';

export default function(sequelize, DataTypes) {
  const PlatilloHistory = sequelize.define('PlatilloHistory', {
    _id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    platilloId: DataTypes.BIGINT.UNSIGNED,
    description: DataTypes.TEXT,
    price: 'NUMERIC(17, 2)'
  }, {
    freezeTableName: true,
    tableName
  });

  return PlatilloHistory;
}
