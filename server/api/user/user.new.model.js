'use strict';

/*eslint-env node*/

import crypto from 'crypto';
import config from '../../config/environment';
import Sequelize from 'sequelize';

const tableName = 'new-users';
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

  const NewUser = sequelize.define('NewUser', {
    _id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
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
      validate: {
        checkUnique: function(value, cb) {
          let self = this;
          if (value) {
            let _id = self._id || -1;
            let query = `SELECT _id
              FROM \`users\`
              WHERE email = :email
              UNION ALL
              SELECT _id
              FROM \`${tableName}\`
              WHERE email = :email AND
              createdAt >= DATE_SUB(NOW(), INTERVAL 1 DAY) AND
              usedAt IS NULL
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
        },
        minlength(value) {
          if (value && value.length < minPasswordLength) {
            throw new Error(
              `Deben de ser cuando menos ${minPasswordLength} caracteres`
            );
          }
        },
        maxlength(value) {
          if (value && value.length > maxPasswordLength) {
            throw new Error(
              `Deben de ser máximo ${maxPasswordLength} caracteres`
            );
          }
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
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    usedAt: {
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
      beforeCreate(entity, options) {
        entity.email = entity.email.toLowerCase();
        return entity.updatePassword();
      }
    },
    freezeTableName: true,
    tableName
  });

  NewUser.prototype.authenticate = function(password) {
    return cryptoPbkdf2(password, this.salt)
      .then(hashedPassword => {
        if (hashedPassword === this.password) {
          return true;
        } else {
          return false;
        }
      });
  };
/*
  User.prototype.authenticate = function(password, callback) {
    if (!callback) {
      return this.password === this.encryptPassword(password);
    }

    const self = this;
    this.encryptPassword(password, function(err, pwdGen) {
      if (err) {
        return callback(err);
      }

      if (self.password === pwdGen) {
        return callback(null, true);
      } else {
        return callback(null, false);
      }
    });
  };
*/
  NewUser.prototype.updatePassword = function() {
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

  return NewUser;
}
