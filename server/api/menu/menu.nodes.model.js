'use strict';

/*eslint-env node*/

import config from '../../config/environment';

const tableName = 'menu-nodes';
const minLength = 0;
const maxLength = 255;

export default function(sequelize, DataTypes) {
  const MenuNodes = sequelize.define('MenuNodes', {
    _id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    // name: {
    //   type: DataTypes.STRING,
    //   defaultValue: '',
    //   validate: {
    //     notEmpty: {
    //       msg: 'Requerido'
    //     },
    //     minlength(value) {
    //       if (value && value.length < minLength) {
    //         throw new Error(
    //           `Deben de ser cuando menos ${minLength} caracteres`
    //         );
    //       }
    //     },
    //     maxlength(value) {
    //       if (value && value.length > maxLength) {
    //         throw new Error(
    //           `Deben de ser máximo ${maxLength} caraceres`
    //         );
    //       }
    //     },
    //     checkUniqueRestaurante: function(value, cb) {
    //       let self = this;
    //       if (this.tipo !== config.tiposNodos[0]) {
    //         return cb();
    //       }
    //       if (value) {
    //         let _id = self._id || -1;
    //         let query = `SELECT _id
    //           FROM \`${tableName}\`
    //           WHERE
    //             LOWER(name)=LOWER(:name) AND
    //             tipo = :tipo AND
    //             deletedAt IS NULL
    //           LIMIT 1;`;
    //         return sequelize.query(query, {
    //           replacements: {
    //             name: this.name,
    //             tipo: config.tiposNodos[0]
    //           },
    //           type: Sequelize.QueryTypes.SELECT
    //         })
    //           .then(d => {
    //             if (d && d[0] && d[0]._id && d[0]._id !== _id) {
    //               return cb('Este restaurante ya está registrado');
    //             }
    //             return cb();
    //           })
    //           .catch(function(err) {
    //             return cb(err);
    //           });
    //       } else {
    //         return cb();
    //       }
    //     }
    //   }
    // },
    tipo: {
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
        isIn: {
          args: [config.tiposNodos],
          msg: 'Este tipo de nodo no es válido'
        }
      }
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    authorId: DataTypes.BIGINT.UNSIGNED,
    editorId: DataTypes.BIGINT.UNSIGNED,
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW()
    },
    updatedAt: {
      type: DataTypes.DATE
    },
    deletedAt: DataTypes.DATE
  }, {
    // indexes: [
    //   { type: 'FULLTEXT', name: 'text_idx', fields: [
    //     'name'
    //   ] }
    // ],
    // hooks: {
    //   beforeValidate(entity) {
    //     entity.name = entity.name || '';
    //   },
    //   beforeCreate(entity) {
    //     entity.name = entity.name || '';
    //   },
    //   beforeUpdate(entity) {
    //     entity.name = entity.name || '';
    //   },
    //   beforeSave(entity) {
    //     entity.name = entity.name || '';
    //   }
    // },
    freezeTableName: true,
    tableName
  });

  return MenuNodes;
}
