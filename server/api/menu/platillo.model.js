'use strict';

/*eslint-env node*/

const tableName = 'platillos';
const minimoPrecio = '0.00';
const maximoPrecio = '999999999999999.99';
const minLength = 0;
const maxLength = 255;

export default function(sequelize, DataTypes) {
  const Platillo = sequelize.define('Platillo', {
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
    description: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: {
          msg: 'Requerido'
        }
      }
    },
    image: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    price: {
      type: 'NUMERIC(17, 2)',
      defaultValue: 0.0,
      validate: {
        min: {
          args: minimoPrecio,
          msg: 'El precio del platillo no puede ser menor a $0.00'
        },
        max: {
          args: maximoPrecio,
          msg: `El precio del platillo no puede ser mayor a $${maximoPrecio}`
        },
        validNumber(value) {
          if (value && !/^(([0-9]{0,15}.[0-9]{0,2})|([0-9]{0,15}))$/.test(value)) {
            throw new Error(
              `El precio '${value}' no es válido`
            );
          }/*
          if (value && (isNaN(value) || ((value ^ 0) !== +value))) {
            throw new Error(
              `El precio '${value}' no es válido`
            );
          }*/
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

  return Platillo;
}
