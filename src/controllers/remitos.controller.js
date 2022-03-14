const connect = require('../database');
const Remito = require('../models/remito.model');
const Producto = require('../models/producto.model');
const Estado = require('../models/estado.model');
const integrarRepetidos = require('../helpers/integrarRepetidos');


const typeMessage = {
    success: 'alert-success',
    danger: 'alert-danger',
    warning: 'alert-warning',
    info: 'alert-info',
    dark: 'alert-dark',
}

Remito.removeAttribute('id');
Producto.removeAttribute('id');

//---- QUERIES -----
// devuelve todos los pedidos
const arrayQuery = ["select pedido, cliente, cli_nom, estado, fecha from remitosremotos where ", , "group by pedido, cliente order by fecha desc"];
// devuelve la cantidad de pedidos

const arrayQueryOneOrder = ["select  count(pedido) as cant_ped from (select pedido from remitosremotos where", , " group by pedido, cliente ) as pedidos"];
// devuelve si el pedido esta escaneado o no
const arrayQueryEscanOrNoScan = ["select sum(ingresada) as sum_ingresada from remitosremotos where ", ];
const arrayExistePedido = ["select sum(cantidad) as sum_cantidad from remitosremotos where ", ];

// funcion para convertir el arrayQuery en un string
const reducer = (previousValue, currentValue) => previousValue + currentValue;


module.exports = {

    homeRemitos: async(req, res) => {
        let message = 'Puede comenzar con la busqueda de pedidos!';
        res.render('remitosremotossearch', { typeMsg: typeMessage.info, message: message });
    },

    // Me retorna los items de un pedido
    getOneRemito: async(req, res) => {
        // conexion a mysql2
        const connection = await connect();
        Remito.removeAttribute('id');
        Producto.removeAttribute('id');
        const { nroPedido, nroCliente } = req.params;
        const dataSearch = req.query;
        let maxSecuencia = 0; // Me indica la secuencia maxima del producto perteneciente al pedido
        let message = "";
        let itemsRemitoDB; // producto, descripcion, cantidad EN CRUDO
        let itemsRemitoView = []; // producto, descripcion, cantidad LISTO PARA LA VISTA|
        let dataRemito;
        let productosDB;
        const dataProducts = [];

        // Sumo las cantidades en columna cantidad para saber si existe el pedido
        arrayExistePedido.splice(1, 1, `pedido = ${nroPedido} and cliente = ${nroCliente}`)
        let [
            [existePedido]
        ] = await connection.execute(arrayExistePedido.reduce(reducer));
        existePedido = existePedido.sum_cantidad > 0;

        if (existePedido) {
            // Averiguro si el pedido esta escaneado o no lo esta
            arrayQueryEscanOrNoScan.splice(1, 1, `pedido = ${nroPedido} and cliente = ${nroCliente}`);
            let [
                [escaneado]
            ] = await connection.execute(arrayQueryEscanOrNoScan.reduce(reducer));
            escaneado = escaneado.sum_ingresada > 0;

            // Obtengo codigo, descripcion, cantidad y secuencia de producto del pedido
            if (escaneado) {
                itemsRemitoDB = await Remito.findAll({ attributes: ["producto", "pro_nom", "ingresada", "secuencia"], where: { pedido: nroPedido, cliente: nroCliente }, order: ["pro_nom"] });
                itemsRemitoDB.forEach(item => itemsRemitoView.push(item.dataValues))
            } else {
                itemsRemitoDB = await Remito.findAll({ attributes: ["producto", "pro_nom", "cantidad", "secuencia"], where: { pedido: nroPedido, cliente: nroCliente }, order: ["pro_nom"] });
                itemsRemitoDB.forEach(item => itemsRemitoView.push(item.dataValues))
                    // codigo para unificar cantidades
                const { unificados, repetidos } = integrarRepetidos(itemsRemitoView);
                console.log(unificados);
                console.log(repetidos);
                for (const producto of unificados) {
                    await Remito.update({ cantidad: producto.cantidad }, { where: { pedido: nroPedido, cliente: nroCliente, producto: producto.producto, secuencia: producto.secuencia } });
                }
                for (const producto of repetidos) {
                    await Remito.destroy({ where: { pedido: nroPedido, cliente: nroCliente, producto: producto.producto, secuencia: producto.secuencia } })
                }
                itemsRemitoDB = await Remito.findAll({ attributes: ["producto", "pro_nom", "cantidad", "secuencia"], where: { pedido: nroPedido, cliente: nroCliente }, order: ["pro_nom"] });
                itemsRemitoView = [];
                itemsRemitoDB.forEach(item => itemsRemitoView.push(item.dataValues))
            }
            // obtengo el estado, cli_nom, fecha del pedido 
            dataRemito = await Remito.findOne({ attributes: ["estado", "cli_nom", "fecha"], where: { pedido: nroPedido, cliente: nroCliente } });
            // obtengo numero de secuencia maximo
            maxSecuencia = await Remito.max('secuencia', { where: { pedido: nroPedido, cliente: nroCliente } });
            // Pruebas

            // Obtengo todos los productos. {codigo , descripcion}
            productosDB = await Producto.findAll({ attributes: ["producto", "pro_nom"] });
            for (let i = 0; i < productosDB.length; i++) {
                dataProducts.push(productosDB[i].dataValues);
            }

            res.render('detalleremito', { data: itemsRemitoView, dataProducts, nroPedido, nroCliente, escaneado, estadoPedido: dataRemito.dataValues.estado, fechaPedido: dataRemito.dataValues.fecha, clientePedido: dataRemito.dataValues.cli_nom, maxSecuencia, /* datos req.query => */ dataSearch })
                // res.render('detalleremito', { data: itemsRemitoView, dataProducts: dataProducts, nroPedido: nroPedido, nroCliente: nroCliente, escaneado: escaneado, estadoPedido: dataRemito.dataValues.estado, fechaPedido: dataRemito.dataValues.fecha, clientePedido: dataRemito.dataValues.cli_nom, maxSecuencia, /* datos req.query => */ dataSearch })
        } else {
            message = `Atencion! El pedido Nro: ${nroPedido} está anulado.`;
            return res.render('remitosremotossearch', { typeMsg: typeMessage.warning, message: message, dataSearch });
        }
        connection.close();
    },

    // Metodo que trae todos los pedidos
    getRemitos: async(req, res) => {
        // conexion a mysql2
        const connection = await connect();
        const { pedido, cliente, estado, fecha_desde, fecha_hasta } = req.body;
        const { offset, limit } = req.query;
        let message = "Atencion! No existen pedidos para los datos ingresados";
        let conditionQuery = "";
        if (pedido == "" && cliente == "" && estado == "default" && fecha_desde == "" && fecha_hasta == "") {
            message = "Atencion! debe ingresar al menos un criterio de busqueda";
            res.render('remitosremotossearch', { typeMsg: typeMessage.warning, message: message });
        } else {
            if (pedido == "") {
                if (cliente == "") {
                    if (estado == "default") {
                        if (fecha_desde !== "" && fecha_hasta !== "") {
                            conditionQuery = (` fecha between '${fecha_desde}' and '${fecha_hasta}' `);
                        } else {
                            if (fecha_desde !== "") {
                                conditionQuery = (` fecha >= '${fecha_desde}' `);
                            } else {
                                conditionQuery = (` fecha <= '${fecha_hasta}' `);
                            }
                        }
                    } else {
                        if (fecha_desde !== "" && fecha_hasta !== "") {
                            conditionQuery = (` estado = '${estado}' and fecha between '${fecha_desde}' and '${fecha_hasta}' `);
                        } else {
                            if (fecha_desde !== "") {
                                conditionQuery = (` estado = '${estado}' and fecha >= '${fecha_desde}' `);
                            } else {
                                if (fecha_hasta !== "") {
                                    conditionQuery = (` estado = '${estado}' and fecha <= '${fecha_hasta}' `);
                                } else {
                                    conditionQuery = (` estado = '${estado}' `);
                                }
                            }
                        }
                    }

                } else {
                    if (estado !== "default" && fecha_desde !== "" && fecha_hasta !== "") {
                        conditionQuery = (` cliente = ${cliente} and estado = '${estado}' and fecha between '${fecha_desde}' and '${fecha_hasta}' `);
                    } else {
                        if (estado !== "default" && fecha_desde !== "") {
                            conditionQuery = (` cliente = ${cliente} and estado = '${estado}' and fecha >= '${fecha_desde}' `);
                        } else {
                            if (estado !== "default" && fecha_hasta !== "") {
                                conditionQuery = (` cliente = ${cliente} and estado = '${estado}' and fecha <= '${fecha_hasta}' `);
                            } else {
                                if (estado !== "default") {
                                    conditionQuery = (` cliente = ${cliente} and estado = '${estado}' `);
                                } else {
                                    if (fecha_desde !== "" && fecha_hasta !== "") {
                                        conditionQuery = (` cliente = ${cliente} and fecha between '${fecha_desde}' and '${fecha_hasta}' `);
                                    } else {
                                        if (fecha_desde !== "") {
                                            // PEDIDOS PARA UN CLIENTE DESDE UNA FECHA DETERMINADA
                                            conditionQuery = (` cliente = ${cliente} and fecha >= '${fecha_desde}' `);
                                        } else {
                                            if (fecha_hasta !== "") {
                                                conditionQuery = (` cliente = ${cliente} and fecha <= '${fecha_hasta}' `);
                                            } else {
                                                // PEDIDOS PARA UN CLIENTE DETERMINADO
                                                conditionQuery = (` cliente = ${cliente} `);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                }
            } else {
                if (cliente !== '') {
                    // Busco por pedido
                    conditionQuery = ` pedido = ${pedido} and cliente = ${cliente} `;
                } else {
                    conditionQuery = ` pedido = ${pedido} `;
                }
            }

            // obtengo la cantidad de pedidos que hay para el criterio de busqueda
            arrayQueryOneOrder.splice(1, 1, conditionQuery);
            const [
                [cant]
            ] = await connection.execute(arrayQueryOneOrder.reduce(reducer));
            if (cant.cant_ped == 0) {
                // no hay pedidos para mostrar
                return res.render('remitosremotossearch', { typeMsg: typeMessage.warning, message: message, dataSearch: req.body });
            } else {
                // hay pedidos para mostrar
                const currentPage = 1;
                // cantidad de paginas segun el limit
                const pages = Math.ceil(cant.cant_ped / limit) // entero mayor mas cercano
                const copyArrayQuery = arrayQuery.map(elem => elem);
                copyArrayQuery.splice(1, 1, conditionQuery);
                copyArrayQuery.push(` limit ${offset}, ${limit}`);
                const query = copyArrayQuery.reduce(reducer);
                const data = await connection.execute(query);

                connection.close();
                // renderPagesOrMessage(req.query, res, conditionQuery, typeMessage.warning, message);
                return res.render('remitosremotospages', { data: data[0], cant_ped: cant.cant_ped, conditionQuery: conditionQuery, currentPage, pages, offset, limit, dataSearch: req.body });
            }
        }
    },
    nextOrBeforePage: async(req, res) => {
        let { next, cant_ped, offset, limit, currentPage, pages, conditionQuery } = req.query;
        const connection = await connect();
        if (!next || next == 1) {
            currentPage++;
            offset = Number(offset) + Number(limit);
        } else {
            currentPage--;
            offset = Number(offset) - Number(limit);
        }
        const copyArrayQuery = arrayQuery.map(elem => elem);
        copyArrayQuery.splice(1, 1, conditionQuery);
        copyArrayQuery.push(` limit ${offset}, ${limit}`);
        const query = copyArrayQuery.reduce(reducer);
        const data = await connection.execute(query);
        connection.close();
        return res.render('remitosremotospages', { data: data[0], cant_ped, offset, limit, currentPage, pages, conditionQuery, dataSearch: req.query });

    },

    updateRemito: async(req, res) => {

        // conexion a mysql2
        const connection = await connect();

        Remito.removeAttribute('id');
        Producto.removeAttribute('id');
        const { nroPedido, nroCliente } = req.params;
        const { producto, pro_nom, cantidad, estado, estado_modificado, item_modificado, item_secuencia } = req.body;
        const { escaneado, fecha, cli_nom } = req.query; // formulario de busqueda
        let message = '';
        // Obtengo los estados arrayEstados = [ 'A', 'G', 'I', 'X' ] de la BD
        const estados = await Estado.findAll();
        const arrayEstados = [];
        estados.forEach(element => {
            arrayEstados.push(element.dataValues.estado);
        })

        console.log(item_modificado);

        // Si el pedido tiene un solo item o tiene varios
        if (producto !== '' && producto > 0 && pro_nom !== '' && cantidad !== '' && cantidad > 0 && arrayEstados.includes(estado)) {
            if (escaneado == 'true') {
                await Remito.update({ estado: estado, producto: producto, pro_nom: pro_nom, ingresada: cantidad }, { where: { pedido: nroPedido, cliente: nroCliente } });
            } else {
                await Remito.update({ estado: estado, producto: producto, pro_nom: pro_nom, cantidad: cantidad }, { where: { pedido: nroPedido, cliente: nroCliente } });
            }
        } else {
            if ((typeof producto == 'object' && producto.length > 0) && (typeof pro_nom == 'object' && pro_nom.length > 0) && (typeof cantidad == 'object' && cantidad.length > 0) && arrayEstados.includes(estado)) {
                const productosModificados = [];
                const itemsAgregados = [];
                const itemsEliminados = [];
                //Selecciono los productos agregados y modificados
                for (let i = 0; i < producto.length; i++) {
                    if (item_modificado[i] == '1') {
                        productosModificados.push({ producto: producto[i], pro_nom: pro_nom[i], cantidad: cantidad[i], secuencia: item_secuencia[i] });
                    }

                    if (item_modificado[i] == '2') {
                        itemsAgregados.push({ producto: producto[i], pro_nom: pro_nom[i], cantidad: cantidad[i], secuencia: item_secuencia[i] }); //BD
                    }
                    if (item_modificado[i] == '3') {
                        itemsEliminados.push({ producto: producto[i], secuencia: item_secuencia[i] }); //BD
                    }
                }
                console.log(productosModificados);

                // recupero datos del cliente y el producto en la BD
                const dataCliente = await connection.execute(`select tipo, talonario from remitosremotos where cliente = ${nroCliente} order by fecha asc limit 1`);
                const dataProductos = [];
                for (const item of itemsAgregados) { // DATOS DEL PRODUCTO
                    dataProductos.push(await connection.execute(`select unidades from remitosremotos where producto = ${item.producto} order by fecha asc limit 1`))
                }

                // Grabo las modificaciones del pedido
                for (let i = 0; i < productosModificados.length; i++) {
                    await Remito.update({ estado: estado, producto: productosModificados[i].producto, pro_nom: productosModificados[i].pro_nom, ingresada: productosModificados[i].cantidad }, { where: { pedido: nroPedido, cliente: nroCliente, secuencia: productosModificados[i].secuencia } });
                }
                // Agrego los items nuevos a la BD
                for (let i = 0; i < itemsAgregados.length; i++) {
                    await Remito.create({ talonario: dataCliente[0].talonario, pedido: nroPedido, secuencia: itemsAgregados[i].secuencia, fecha: fecha, cliente: nroCliente, tipo: dataCliente[0].tipo, producto: itemsAgregados[i].producto, bulto: 0, unidades: dataProductos[i][0].unidades, cantidad: itemsAgregados[i].cantidad, estado: estado, cli_nom: cli_nom, pro_nom: itemsAgregados[i].pro_nom, ingresada: itemsAgregados[i].cantidad, ingresada2: 0 });
                }
                // cambio el estado del pedido si asi lo requiere el usuario
                if (estado_modificado == 1) {
                    await Remito.update({ estado: estado }, { where: { pedido: nroPedido, cliente: nroCliente } });
                }

                // Elimino los items
                for (const item of itemsEliminados) {
                    await Remito.destroy({ where: { pedido: nroPedido, cliente: nroCliente, producto: item.producto, secuencia: item.secuencia } });
                }
            }
        }
        connection.close();
        message = `Los datos para el pedido N°: ${nroPedido} han sido guardados satisfactoriamente!`;
        res.render('remitosremotossearch', { typeMsg: typeMessage.info, message: message });
    },

    deleteRemito: async(req, res) => {

        Remito.removeAttribute('id');

        let message = "";
        const { nroPedido, nroCliente } = req.params;

        const pedidoEliminado = await Remito.destroy({ where: { pedido: nroPedido, cliente: nroCliente } });

        if (pedidoEliminado > 0) {
            message = `El pedido Nro: ${nroPedido} se ha eliminado con exito!`;
            res.render('remitosremotossearch', { typeMsg: typeMessage.success, message: message });
        } else {
            message = `El pedido Nro: ${nroPedido} NO se ha eliminado. Algo salio mal!`;
            res.render('remitosremotossearch', { typeMsg: typeMessage.danger, message: message });
        }

    },


}