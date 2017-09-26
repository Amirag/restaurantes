'use strict';

/*eslint-env*/
import Sequelize from 'sequelize';

const tableName = 'estados';
const minLength = 0;
const maxLength = 255;

export default function(sequelize, DataTypes) {
  const Estados = sequelize.define('Estados', {
    _id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
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
                deletedAt IS NULL
              LIMIT 1;`;
            return sequelize.query(query, {
              replacements: {
                name: value
              },
              type: Sequelize.QueryTypes.SELECT
            })
              .then(d => {
                if (d && d[0] && d[0]._id && d[0]._id !== _id) {
                  return cb('Este estado ya está registrado');
                }
                return cb();
              })
              .catch(function(err) {
                return cb(err);
              });
          }
          return cb();
        }
      }
    },
    authorId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    deletedAt: DataTypes.DATE
  }, {
    freezeTableName: true,
    tableName
  });

  return Estados;
}
