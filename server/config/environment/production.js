'use strict';

/*eslint-env node*/

module.exports = {
  sequelize: {
    uri: 'mysql://restaurantes2:restaurantes2@127.0.0.1:3306/restaurantes2',
    options: {
      dialectOptions: {
        multipleStatements: true
      },
      logging: false,
      define: {
        timestamps: false
      }
    }
  }
};
