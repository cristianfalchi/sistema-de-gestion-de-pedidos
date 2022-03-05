const { Sequelize } = require('sequelize');
const { databaseSequelize } = require('./keys');

// prueba con Sequelize para mysql
// parametros de coneccion
const sequelize = new Sequelize(
    databaseSequelize.database,
    databaseSequelize.user,
    databaseSequelize.password,
    databaseSequelize.options
);

module.exports = sequelize;