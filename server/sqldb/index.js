'use strict';

/*eslint-env node*/
import Sequelize from 'sequelize';
import config from '../config/environment';

const db = {
  Sequelize,
  sequelize: new Sequelize(config.sequelize.uri, config.sequelize.options)
};

db.User = db.sequelize.import('../api/user/user.model');
db.NewUser = db.sequelize.import('../api/user/user.new.model');
// db.UserHistory = db.sequelize.import('../api/user/user.history.model');

db.MenuPaths = db.sequelize.import('../api/menu/menu.paths.model');
db.MenuNodes = db.sequelize.import('../api/menu/menu.nodes.model');
// db.MenuNodesHistory = db.sequelize.import(
//   '../api/menu/menu.nodes.history.model'
// );

db.Restaurante = db.sequelize.import('../api/menu/restaurante.model');
// db.RestauranteHistory = db.sequelize.import(
//   '../api/menu/restaurante.history.model'
// );

db.Platillo = db.sequelize.import('../api/menu/platillo.model');
// db.PlatilloHistory = db.sequelize.import(
//   '../api/menu/platillo.history.model'
// );

db.Categoria = db.sequelize.import('../api/menu/categoria.model');
db.Visita = db.sequelize.import('../api/visita/visita.model');
db.MenuLikes = db.sequelize.import('../api/menu/menu.likes.model');
db.MenuAdmin = db.sequelize.import('../api/menu/menu.admin.model');
db.User = db.sequelize.import('User', require('../api/user/user.model'));
// db.UserHistory = db.sequelize.import(
//   'UserHistory',
//   require('../api/user/user.history.model')
// );

db.Estado = db.sequelize.import('../api/estados/estados.model');
db.Ciudad = db.sequelize.import('../api/ciudades/ciudades.model');

// db.User.hasMany(db.UserHistory, { foreignKey: 'userId' });
// db.UserHistory.belongsTo(db.User, { foreignKey: 'userId' });

db.User.hasMany(db.User, { foreignKey: 'authorId' });

db.User.hasMany(db.MenuNodes, { foreignKey: 'authorId' });
db.MenuNodes.belongsTo(db.User, { foreignKey: 'authorId' });

db.User.hasMany(db.MenuNodes, { foreignKey: 'editorId' });
db.MenuNodes.belongsTo(db.User, { foreignKey: 'editorId' });

db.MenuNodes.hasMany(db.MenuPaths, { foreignKey: 'parent' });
db.MenuPaths.belongsTo(db.MenuNodes, { foreignKey: 'parent' });

db.MenuNodes.hasMany(db.MenuPaths, { foreignKey: 'descendant' });
db.MenuPaths.belongsTo(db.MenuNodes, { foreignKey: 'descendant' });

db.MenuNodes.hasMany(db.Restaurante, { foreignKey: '_id' });
db.Restaurante.belongsTo(db.MenuNodes, { foreignKey: '_id' });

db.MenuNodes.hasMany(db.Platillo, { foreignKey: '_id' });
db.Platillo.belongsTo(db.MenuNodes, { foreignKey: '_id' });

db.MenuNodes.hasMany(db.Categoria, { foreignKey: '_id' });
db.Categoria.belongsTo(db.MenuNodes, { foreignKey: '_id' });

db.Estado.hasMany(db.Ciudad, { foreignKey: 'stateId' });
db.Ciudad.belongsTo(db.Estado, { foreignKey: 'stateId' });

db.User.hasMany(db.Estado, { foreignKey: 'authorId' });
db.Estado.belongsTo(db.User, { foreignKey: 'authorId' });

db.User.hasMany(db.Ciudad, { foreignKey: 'authorId' });
db.Ciudad.belongsTo(db.User, { foreignKey: 'authorId' });

db.Restaurante.hasMany(db.Visita, { foreignKey: 'restauranteId' });
db.Visita.belongsTo(db.Restaurante, { foreignKey: 'restauranteId' });

// db.MenuNodes.hasMany(db.MenuNodesHistory, { foreignKey: 'nodeId' });
// db.MenuNodesHistory.belongsTo(db.MenuNodes, { foreignKey: 'nodeId' });

// db.Platillo.hasMany(db.PlatilloHistory, { foreignKey: 'platilloId' });
// db.PlatilloHistory.belongsTo(db.Platillo, { foreignKey: 'platilloId' });

// db.Restaurante.hasMany(db.RestauranteHistory, {
//   foreignKey: 'restauranteId'
// });

// db.RestauranteHistory.belongsTo(db.Restaurante, {
//  foreignKey: 'restauranteId'
// });

// Relaciones N:M
db.Restaurante.belongsToMany(db.User, {
  through: db.MenuLikes,
  foreignKey: 'restauranteId'
});

db.User.belongsToMany(db.Restaurante, {
  through: db.MenuLikes,
  foreignKey: 'userId'
});

db.Restaurante.belongsToMany(db.User, {
  through: db.MenuAdmin,
  foreignKey: 'restauranteId'
});

db.User.belongsToMany(db.Restaurante, {
  through: db.MenuAdmin,
  foreignKey: 'userId'
});

module.exports = db;
