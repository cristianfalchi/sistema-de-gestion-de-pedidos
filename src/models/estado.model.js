const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize'); // la instancia de conexion

class Estado extends Model {

}

module.exports = Estado.init({
    // Model attributes are defined here
    estado: { type: DataTypes.CHAR, primaryKey: true },
    nom_estado: DataTypes.TEXT,

}, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Estado', // We need to choose the model name
    tableName: 'estados',
    timestamps: false
});