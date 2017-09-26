'use strict';

/*eslint-env node*/
const tableName = 'restaurantes-history';

export default function(sequelize, DataTypes) {
  const RestauranteHistory = sequelize.define('RestauranteHistory', {
    _id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    restauranteId: DataTypes.BIGINT.UNSIGNED,
    description: DataTypes.TEXT,
    image: DataTypes.UUID,
    imageExtension: 'VARCHAR(4)',
    state: DataTypes.STRING,
    city: DataTypes.STRING,
    telephone1: DataTypes.STRING,
    telephone2: DataTypes.STRING,
    address1: DataTypes.STRING,
    address2: DataTypes.STRING,
    postalCode: DataTypes.STRING,
    horarioLunesApertura: DataTypes.STRING(8),
    horarioLunesCierre: DataTypes.STRING(8),
    horarioMartesApertura: DataTypes.STRING(8),
    horarioMartesCierre: DataTypes.STRING(8),
    horarioMiercolesApertura: DataTypes.STRING(8),
    horarioMiercolesCierre: DataTypes.STRING(8),
    horarioJuevesApertura: DataTypes.STRING(8),
    horarioJuevesCierre: DataTypes.STRING(8),
    horarioViernesApertura: DataTypes.STRING(8),
    horarioViernesCierre: DataTypes.STRING(8),
    horarioSabadoApertura: DataTypes.STRING(8),
    horarioSabadoCierre: DataTypes.STRING(8),
    horarioDomingoApertura: DataTypes.STRING(8),
    horarioDomingoCierre: DataTypes.STRING(8),
    visitas: DataTypes.BIGINT.UNSIGNED,
    likes: DataTypes.BIGINT.UNSIGNED,
    servicioDomicilio: DataTypes.BOOLEAN
  }, {
    freezeTableName: true,
    tableName
  });

  return RestauranteHistory;
}
