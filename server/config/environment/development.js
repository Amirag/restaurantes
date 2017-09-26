'use strict';

/*eslint-env node*/

module.exports = {
  sequelize: {
    uri: 'mysql://restaurantes2:restaurantes2@127.0.0.1:3306/restaurantes2',
    options: {
      dialectOptions: {
        multipleStatements: true
      },
      logging: console.log,
      define: {
        timestamps: false
      }
    }
  },
  smtp: {
    credentials: {
      user: 'mis.restaurantes2017@gmail.com',
      pass: 'A6pb983JPMkGvt7bAlFa'
    },
    from: 'Mis restaurantes <mis.restaurantes2017@gmail.com>'
  }
};
