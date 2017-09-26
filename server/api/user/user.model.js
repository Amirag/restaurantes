'use strict';

/*eslint-env node*/

import crypto from 'crypto';
import config from '../../config/environment';
import Sequelize from 'sequelize';

const tableName = 'users';
const minPasswordLength = 4;
const maxPasswordLength = 8;

export default function(sequelize, DataTypes) {
  let cryptoSalt = function(byteSize = 16) {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(byteSize, function(err, salt) {
        if (err) {
          reject(err);
        }
        resolve(salt.toString('base64'));
      });
    });
  };

  let cryptoPbkdf2 = function(
    password,
    salt,
    iterations = 10000,
    keylength = 64,
    digest = 'sha512'
  ) {
    const saltBase64 = new Buffer(salt, 'base64');
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        password,
        saltBase64,
        iterations,
        keylength,
        digest,
        function(err, key) {
          if (err) {
            reject(err);
          }
          resolve(key.toString('base64'));
        });
    });
  };

  const User = sequelize.define('User', {
    _id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        // notEmpty: {
          // msg: 'Requerido'
        // },
        len: {
          args: [0, 255],
          msg: 'Deben de ser máximo 255 caracteres'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      defaultValue: '',
      unique: {
        msg: 'El email ya está en uso'
      },
      validate: {
        checkUnique: function(value, cb) {
          let self = this;
          if (value) {
            let _id = self._id || -1;
            let query = `SELECT _id
              FROM \`${tableName}\`
              WHERE email = :email
              LIMIT 1;`;
            return sequelize.query(query, {
              replacements: {
                email: value
              },
              type: Sequelize.QueryTypes.SELECT
            })
              .then(d => {
                if (d && d[0] && d[0]._id && d[0]._id !== _id) {
                  return cb('Este email ya está en uso');
                }
                return cb();
              })
              .catch(function(err) {
                return cb(err);
              });
          } else {
            return cb();
          }
        },
        isEmail: {
          msg: 'Email inválido'
        },
        len: {
          args: [0, 255],
          msg: 'Deben de ser máximo 255 caracteres'
        },
        notEmpty: {
          msg: 'Requerido'
        }
      }
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'usuario',
      validate: {
        isIn: {
          args: [config.roles],
          msg: 'El rol del usuario no es válido'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        notEmpty: {
          msg: 'Requerido'
        }
      }
    },
    provider: DataTypes.STRING,
    salt: DataTypes.STRING,
    address1: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        len: {
          args: [0, 255],
          msg: 'Deben de ser máximo 255 caracteres'
        }
      }
    },
    address2: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        len: {
          args: [0, 255],
          msg: 'Deben de ser máximo 255 caracteres'
        }
      }
    },
    city: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        len: {
          args: [0, 255],
          msg: 'Deben de ser máximo 255 caracteres'
        }
      }
    },
    state: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        len: {
          args: [0, 255],
          msg: 'Deben de ser máximo 255 caracteres'
        }
      }
    },
    postalCode: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        is: {
          args: /^$|^[0-9]{5}$/,
          msg: 'El código postal no parece ser válido'
        }
      }
    },
    editorId: DataTypes.BIGINT.UNSIGNED,
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE
    },
    deletedAt: {
      type: DataTypes.DATE
    }
  }, {
    getterMethods: {
      profile() {
        return {
          _id: this._id,
          name: this.name,
          role: this.role
        };
      }
    },
    hooks: {
      beforeUpdate(entity, options) {
        entity.email = entity.email.toLowerCase();
        if (entity.changed('password')) {
          return entity.updatePassword();
        }
      }
    },
    freezeTableName: true,
    tableName
  });

  User.prototype.authenticate = function(password) {
    return cryptoPbkdf2(password, this.salt)
      .then(hashedPassword => {
        if (hashedPassword === this.password) {
          return true;
        } else {
          return false;
        }
      });
  };

  User.prototype.updatePassword = function() {
    if (!this.password) return;
    return cryptoSalt()
      .then(salt => {
        this.salt = salt;
        return cryptoPbkdf2(this.password, this.salt);
      })
      .then(hashedPassword => {
        this.password = hashedPassword;
        return;
      });
  };
  return User;
}
