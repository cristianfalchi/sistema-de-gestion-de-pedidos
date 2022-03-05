const connect = require('../database');

module.exports = {

    homeRemitos: (req, res) => {
        res.render('remitosexpress');
    },

    getRemitos: async(req, res) => {
        const { cliente, pedido, fecha_desde, fecha_hasta } = req.query;
        const connection = await connect();
        const consulta = `select pedido, fecha, cliente, cli_nom, estado, count(producto) as cant_prod from remitosremotos where cliente = ${cliente} group by pedido`;
        const data = await connection.execute(consulta);

        res.render('remitosexpress', { data: data[0] });
    },

    getRemitosDesdeHasta: async(req, res) => {

    },

    updateRemito: async(req, res) => {

    },

    deleteRemito: async(idPedido) => {

    }

}