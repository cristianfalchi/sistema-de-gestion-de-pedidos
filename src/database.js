// Modulo para conectarnos a la base de datos
const mysql = require('mysql2/promise');
const { database } = require('./keys');

module.exports = async function connect() {
    return await mysql.createConnection(database);
}