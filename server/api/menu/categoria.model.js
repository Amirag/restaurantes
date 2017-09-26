'use strict';

/*eslint-env node*/
const tableName = 'categorias';
const minLength = 0;
const maxLength = 255;

export default function(sequelize, DataTypes) {
  const Categoria = sequelize.define('Categoria', {
    _id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        notEmpty: {
          msg: 'Requerido'
        },
        minlength(value) {
          if (value && value.length < minLength) {
            throw new Error(
              `Deben de ser cuando menos ${minLength} caracteres`
            );
          }
        },
        maxlength(value) {
          if (value && value.length > maxLength) {
            throw new Error(
              `Deben de ser máximo ${maxLength} caracteres`
            );
          }
        }
      }
    },
    position: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0
    }
  }, {
    freezeTableName: true,
    tableName
  });

  return Categoria;
}
