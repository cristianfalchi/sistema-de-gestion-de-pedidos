const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize'); // la instancia de conexion

class Pedido extends Model {

}

module.exports = Pedido.init({
    // Model attributes are defined here
    talonario: DataTypes.INTEGER,
    pedido: DataTypes.INTEGER,
    fecha: DataTypes.TEXT,
    cliente: DataTypes.INTEGER,
    tipo: DataTypes.INTEGER,
    producto: DataTypes.INTEGER,
    bulto: DataTypes.INTEGER,
    unidades: DataTypes.INTEGER,
    cantidad: DataTypes.INTEGER,
    precio: DataTypes.DOUBLE,
    secuencia: DataTypes.INTEGER,
    estado: DataTypes.TEXT,
    cli_nom: DataTypes.TEXT,
    pro_nom: DataTypes.TEXT,
    lista: DataTypes.INTEGER,
    condicion: DataTypes.TEXT,
    ruta: DataTypes.TEXT,
    internos: DataTypes.DOUBLE,
    ingresada: DataTypes.INTEGER,
    info: DataTypes.INTEGER,
    vendedor: DataTypes.TEXT

}, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Pedido', // We need to choose the model name
    tableName: 'pedidosremotos',
    timestamps: false
});