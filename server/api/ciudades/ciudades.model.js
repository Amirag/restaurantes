'use strict';

/*eslint-env node*/

import Sequelize from 'sequelize';

const tableName = 'ciudades';
const minLength = 0;
const maxLength = 255;

export default function(sequelize, DataTypes) {
  const Ciudades = sequelize.define('Ciudades', {
    '_id': {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    'name': {
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
              `Deben de ser máximo ${maxLength} caraceres`
            );
          }
        },
        checkUnique: function(value, cb) {
          let self = this;
          if (value) {
            let _id = self._id || -1;
            let query = `SELECT _id
              FROM \`${tableName}\`
              WHERE
                LOWER(name)=LOWER(:name) AND
                \`postal-code\`=:postalCode AND
                deletedAt IS NULL
              LIMIT 1;`;
            return sequelize.query(query, {
              replacements: {
                name: this.name,
                postalCode: this['postal-code']
              },
              type: Sequelize.QueryTypes.SELECT
            })
              .then(d => {
                if (d && d[0] && d[0]._id && d[0]._id !== _id) {
                  return cb(
                    'Esta ciudad ya está registada con este código postal'
                  );
                }
                return cb();
              })
              .catch(function(err) {
                return cb(err);
              });
          } else {
            return cb();
          }
        }
      }
    },
    'postal-code': {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        notEmpty: {
          msg: '¿Cuál es el código postal de la ciudad?'
        },
        is: {
          args: /^[0-9]{5}$/,
          msg: 'El código postal no es válido'
        }
      }
    },
    'stateId': {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        checkState: function(value, cb) {
          if (value) {
            if (value === -1 || value === "-1") {
              return cb('Es necesario seleccionar un estado');
            }
            let query = `SELECT _id
              FROM \`estados\`
              WHERE _id = :id AND deletedAt IS NULL
              LIMIT 1;`;
            sequelize.query(query, {
              replacements: {
                id: value
              },
              type: Sequelize.QueryTypes.SELECT
            })
              .then(d => {
                if (d && d[0]) {
                  return cb();
                }
                return cb('Este estado aún no está dado de alta');
              });
          } else {
            return cb('El estado es requerido');
          }
        }
      }
    },
    'authorId': {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    'active': {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    'createdAt': {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    'deletedAt': DataTypes.DATE
  }, {
    hooks: {
      beforeValidate(entity, options) {
        entity.stateId = entity.stateId || -1;
        return;
      },
      beforeCreate(entity, options) {
        entity.stateId = entity.stateId || -1;
        return;
      },
      beforeUpdate(entity, options) {
        entity.stateId = entity.stateId || -1;
        return;
      }
    },
    freezeTableName: true,
    tableName
  });

  return Ciudades;
}
