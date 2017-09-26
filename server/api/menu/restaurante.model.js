'use strict';

/*eslint-env node*/
// import config from '../../config/environment';
import Sequelize from 'sequelize';
const tableName = 'restaurantes';
const minLength = 0;
const maxLength = 255;

export default function(sequelize, DataTypes) {
  const Restaurante = sequelize.define('Restaurante', {
    _id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      defaultValue: '',
      unique: true,
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
        },
        checkUnique: function(value, cb) {
          let self = this;
          if (value) {
            let _id = self._id || -1;
            let query = `SELECT _id
              FROM \`${tableName}\`
              WHERE
                LOWER(name)=LOWER(:name)
              LIMIT 1;`;
            return sequelize.query(query, {
              replacements: { name: value },
              type: Sequelize.QueryTypes.SELECT
            })
              .then(d => {
                if (d && d[0] && d[0]._id && d[0]._id !== _id) {
                  return cb('Este restaurante ya está registrado');
                }
                return cb();
              })
              .catch(err => cb(err));
          } else {
            return cb();
          }
        },
        checkValid(value) {
          if (value && value.includes('_')) {
            throw new Error('No está permitido utilizar guión bajo');
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
    keywords: {
      type: DataTypes.TEXT
    },
    image: {
      type: DataTypes.STRING,
      defaultValue: 'defaultRestaurant.jpg'
    },
    cityId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        checkState: function(value, cb) {
          if (value) {
            if (value === -1 || value === "-1") {
              return cb('Es necesario seleccionar una ciudad');
            }
            let query = `SELECT _id
              FROM \`ciudades\`
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
              return cb('Esta ciudad aún no está dada de alta');
            });
          } else {
            return cb('La ciudad es requerida');
          }
        }
      }
    },
    telephone1: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        notEmpty: {
          msg: 'Requerido'
        },
        len: {
          args: [0, 255],
          msg: 'Deben de ser máximo 255 caracteres'
        },
        is: {
          args: /^[0-9]{3}\s[0-9]{3}\s[0-9]{4}$/,
          msg: 'Formato de teléfono inválido: ### ### ####'
        }
      }
    },
    telephone2: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        len: {
          args: [0, 255],
          msg: 'Deben de ser máximo 255 caracteres'
        },
        is: {
          args: /(^[0-9]{3}\s[0-9]{3}\s[0-9]{4}$)|(^$)/,
          msg: 'Formato de teléfono inválido: ### ### ####'
        }
      }
    },
    address1: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        notEmpty: {
          msg: 'Requerido'
        },
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
        notEmpty: {
          msg: 'Requerido'
        },
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
        len: {
          args: [0, 5],
          msg: 'Deben de ser máximo 5 caracteres'
        },
        is: {
          args: /^[0-9]{5}$/,
          msg: 'Formato de código postal inválido: #####'
        }
      }
    },
    horarioLunesApertura: {
      type: DataTypes.STRING(8),
      defaultValue: '',
      validate: {
        len: {
          args: [0, 8],
          msg: 'Deben de ser máximo 8 caracteres'
        },
        is: {
          args: /^[0-1][0-9]:[0-5][0-9] (a|p)m/,
          msg: 'Formato de horario inválido: hh:mm aa'
        }
      }
    },
    horarioLunesCierre: {
      type: DataTypes.STRING(8),
      defaultValue: '',
      validate: {
        len: {
          args: [0, 8],
          msg: 'Deben de ser máximo 8 caracteres'
        },
        is: {
          args: /^[0-1][0-9]:[0-5][0-9] (a|p)m/,
          msg: 'Formato de horario inválido: hh:mm aa'
        }
      }
    },
    horarioMartesApertura: {
      type: DataTypes.STRING(8),
      defaultValue: '',
      validate: {
        len: {
          args: [0, 8],
          msg: 'Deben de ser máximo 8 caracteres'
        },
        is: {
          args: /^[0-1][0-9]:[0-5][0-9] (a|p)m/,
          msg: 'Formato de horario inválido: hh:mm aa'
        }
      }
    },
    horarioMartesCierre: {
      type: DataTypes.STRING(8),
      defaultValue: '',
      validate: {
        len: {
          args: [0, 8],
          msg: 'Deben de ser máximo 8 caracteres'
        },
        is: {
          args: /^[0-1][0-9]:[0-5][0-9] (a|p)m/,
          msg: 'Formato de horario inválido: hh:mm aa'
        }
      }
    },
    horarioMiercolesApertura: {
      type: DataTypes.STRING(8),
      defaultValue: '',
      validate: {
        len: {
          args: [0, 8],
          msg: 'Deben de ser máximo 8 caracteres'
        },
        is: {
          args: /^[0-1][0-9]:[0-5][0-9] (a|p)m/,
          msg: 'Formato de horario inválido: hh:mm aa'
        }
      }
    },
    horarioMiercolesCierre: {
      type: DataTypes.STRING(8),
      defaultValue: '',
      validate: {
        len: {
          args: [0, 8],
          msg: 'Deben de ser máximo 8 caracteres'
        },
        is: {
          args: /^[0-1][0-9]:[0-5][0-9] (a|p)m/,
          msg: 'Formato de horario inválido: hh:mm aa'
        }
      }
    },
    horarioJuevesApertura: {
      type: DataTypes.STRING(8),
      defaultValue: '',
      validate: {
        len: {
          args: [0, 8],
          msg: 'Deben de ser máximo 8 caracteres'
        },
        is: {
          args: /^[0-1][0-9]:[0-5][0-9] (a|p)m/,
          msg: 'Formato de horario inválido: hh:mm aa'
        }
      }
    },
    horarioJuevesCierre: {
      type: DataTypes.STRING(8),
      defaultValue: '',
      validate: {
        len: {
          args: [0, 8],
          msg: 'Deben de ser máximo 8 caracteres'
        },
        is: {
          args: /^[0-1][0-9]:[0-5][0-9] (a|p)m/,
          msg: 'Formato de horario inválido: hh:mm aa'
        }
      }
    },
    horarioViernesApertura: {
      type: DataTypes.STRING(8),
      defaultValue: '',
      validate: {
        len: {
          args: [0, 8],
          msg: 'Deben de ser máximo 8 caracteres'
        },
        is: {
          args: /^[0-1][0-9]:[0-5][0-9] (a|p)m/,
          msg: 'Formato de horario inválido: hh:mm aa'
        }
      }
    },
    horarioViernesCierre: {
      type: DataTypes.STRING(8),
      defaultValue: '',
      validate: {
        len: {
          args: [0, 8],
          msg: 'Deben de ser máximo 8 caracteres'
        },
        is: {
          args: /^[0-1][0-9]:[0-5][0-9] (a|p)m/,
          msg: 'Formato de horario inválido: hh:mm aa'
        }
      }
    },
    horarioSabadoApertura: {
      type: DataTypes.STRING(8),
      defaultValue: '',
      validate: {
        len: {
          args: [0, 8],
          msg: 'Deben de ser máximo 8 caracteres'
        },
        is: {
          args: /^[0-1][0-9]:[0-5][0-9] (a|p)m/,
          msg: 'Formato de horario inválido: hh:mm aa'
        }
      }
    },
    horarioSabadoCierre: {
      type: DataTypes.STRING(8),
      defaultValue: '',
      validate: {
        len: {
          args: [0, 8],
          msg: 'Deben de ser máximo 8 caracteres'
        },
        is: {
          args: /^[0-1][0-9]:[0-5][0-9] (a|p)m/,
          msg: 'Formato de horario inválido: hh:mm aa'
        }
      }
    },
    horarioDomingoApertura: {
      type: DataTypes.STRING(8),
      defaultValue: '',
      validate: {
        len: {
          args: [0, 8],
          msg: 'Deben de ser máximo 8 caracteres'
        },
        is: {
          args: /^[0-1][0-9]:[0-5][0-9] (a|p)m/,
          msg: 'Formato de horario inválido: hh:mm aa'
        }
      }
    },
    horarioDomingoCierre: {
      type: DataTypes.STRING(8),
      defaultValue: '',
      validate: {
        len: {
          args: [0, 8],
          msg: 'Deben de ser máximo 8 caracteres'
        },
        is: {
          args: /^[0-1][0-9]:[0-5][0-9] (a|p)m/,
          msg: 'Formato de horario inválido: hh:mm aa'
        }
      }
    },
    visitas: {
      type: DataTypes.BIGINT.UNSIGNED,
      defaultValue: 0
    },
    likes: {
      type: DataTypes.BIGINT.UNSIGNED,
      defaultValue: 0
    },
    servicioDomicilio: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    indexes: [
      { type: 'FULLTEXT', name: 'text_idx', fields: [
        'name', 'description', 'keywords'
      ] }
    ],
    hooks: {
      beforeValidate(entity) {
        entity.description = entity.description || '';
        entity.keywords = entity.keywords || '';
      },
      beforeCreate(entity) {
        entity.description = entity.description || '';
        entity.keywords = entity.keywords || '';
      },
      beforeUpdate(entity) {
        entity.description = entity.description || '';
        entity.keywords = entity.keywords || '';
      },
      beforeSave(entity) {
        entity.description = entity.description || '';
        entity.keywords = entity.keywords || '';
      }
    },
    freezeTableName: true,
    tableName
  });

  return Restaurante;
}
