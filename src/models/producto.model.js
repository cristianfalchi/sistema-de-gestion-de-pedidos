const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize'); // la instancia de conexion

class Producto extends Model {

}

module.exports = Producto.init({
    // Model attributes are defined here
    producto: DataTypes.INTEGER,
    pro_nom: DataTypes.TEXT,
    precio: DataTypes.INTEGER,

}, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Producto', // We need to choose the model name
    tableName: 'productos',
    timestamps: false
});