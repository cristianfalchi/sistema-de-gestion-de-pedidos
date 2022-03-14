const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize'); // la instancia de conexion

class Remito extends Model {

}

module.exports = Remito.init({
    // Model attributes are defined here
    talonario: DataTypes.INTEGER,
    pedido: DataTypes.INTEGER,
    secuencia: DataTypes.INTEGER,
    fecha: DataTypes.TEXT,
    cliente: DataTypes.INTEGER,
    tipo: DataTypes.TEXT,
    producto: DataTypes.INTEGER,
    bulto: DataTypes.INTEGER,
    unidades: DataTypes.INTEGER,
    cantidad: DataTypes.INTEGER,
    estado: DataTypes.TEXT,
    cli_nom: DataTypes.TEXT,
    pro_nom: DataTypes.TEXT,
    ingresada: DataTypes.INTEGER,
    ingresada2: DataTypes.INTEGER,
}, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Remito', // We need to choose the model name
    tableName: 'remitosremotos',
    timestamps: false
});