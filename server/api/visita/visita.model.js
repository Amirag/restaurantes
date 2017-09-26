'use strict';

/*eslint-env node*/

const tableName = 'visitas';

export default function(sequelize, DataTypes) {
  const Visita = sequelize.define('Visita', {
    _id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    ip: {
      type: DataTypes.STRING
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

  return Visita;
}
