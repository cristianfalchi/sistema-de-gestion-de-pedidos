const connect = require('../database');
const Pedido = require('../models/pedido.model');
const Producto = require('../models/producto.model');
const Estado = require('../models/estado.model');


const typeMessage = {
    success: 'alert-success',
    danger: 'alert-danger',
    warning: 'alert-warning',
    info: 'alert-info',
    dark: 'alert-dark',
}

Pedido.removeAttribute('id');
Producto.removeAttribute('id');

//---- QUERIES -----
// devuelve todos los pedidos
const arrayQuery = ["select pedido, cliente, cli_nom, vendedor, estado, ruta, fecha from pedidosremotos where ", , "group by pedido, cliente order by fecha desc"];
// devuelve la cantidad de pedidos
// select  count(pedido) as cant_ped from (select pedido from pedidosremotos where estado = 'X' group by pedido, cliente ) as pedidos
const arrayQueryOneOrder = ["select  count(pedido) as cant_ped from (select pedido from pedidosremotos where", , " group by pedido, cliente ) as pedidos"];
// devuelve si el pedido esta escaneado o no
const arrayQueryEscanOrNoScan = ["select sum(ingresada) as sum_ingresada from pedidosremotos where ", ];


// funcion para convertir el arrayQuery en un string
const reducer = (previousValue, currentValue) => previousValue + currentValue;


// funcion que renderiza la vista luego de la busqueda que realiza el usuario
const renderPagesOrMessage = async(fields, response, conditionQuery, typeMsg, message, offset = 0, limit = 10) => {

    // conexion a mysql2
    const connection = await connect();
    console.log(conditionQuery);
    // obtengo la cantidad de pedidos que hay para el criterio de busqueda
    arrayQueryOneOrder.splice(1, 1, conditionQuery);
    console.log(arrayQueryOneOrder.reduce(reducer));
    const [
        [cant]
    ] = await connection.execute(arrayQueryOneOrder.reduce(reducer));
    if (cant.cant_ped == 0) {
        // no hay pedidos para mostrar
        return response.render('pedidosremotossearch', { typeMsg: typeMsg, message: message, pedido: fields.pedido, cliente: fields.cliente, vendedor: fields.vendedor, estado: fields.estado, ruta: fields.ruta, fecha_desde: fields.fecha_desde, fecha_hasta: fields.fecha_hasta });
    } else {
        // hay pedidos para mostrar
        const currentPage = 1;
        const pages = Math.ceil(cant.cant_ped / limit) // entero mayor mas cercano
        const copyArrayQuery = arrayQuery.map(elem => elem);
        copyArrayQuery.splice(1, 1, conditionQuery);
        copyArrayQuery.push(` limit ${offset}, ${limit}`);
        const query = copyArrayQuery.reduce(reducer);
        const data = await connection.execute(query);
        return response.render('pedidosremotospages', { data: data[0], cant_ped: cant.cant_ped, conditionQuery: conditionQuery, currentPage, pages, offset, limit, pedido: fields.pedido, cliente: fields.cliente, vendedor: fields.vendedor, estado: fields.estado, ruta: fields.ruta, fecha_desde: fields.fecha_desde, fecha_hasta: fields.fecha_hasta });
    }

}

module.exports = {

    homePedidos: async(req, res) => {
        Pedido.removeAttribute('id');
        let message = 'Puede comenzar con la busqueda de pedidos!';
        const pedido = await Pedido.findAll({ attributes: ['producto', 'cantidad'], where: { pedido: 12426, cliente: 2424 } });
        res.render('pedidosremotossearch', { typeMsg: typeMessage.info, message: message });
    },

    // Me retorna los items de un pedido
    getOnePedido: async(req, res) => {
        // conexion a mysql2
        const connection = await connect();
        Pedido.removeAttribute('id');
        Producto.removeAttribute('id');
        const { nroPedido, nroCliente, nroRuta } = req.params;
        const { pedido, cliente, vendedor, estado, ruta, fecha_desde, fecha_hasta } = req.query;

        let message = "";
        // variables a enviar al cliente
        let itemsPedidoDB; // producto, descripcion, cantidad EN CRUDO
        const itemsPedidoView = []; // producto, descripcion, cantidad LISTO PARA LA VISTA|
        let dataPedido;
        let productosDB;
        const dataProducts = [];

        // Averiguro si el pedido esta escaneado o no lo esta
        arrayQueryEscanOrNoScan.splice(1, 1, `pedido = ${nroPedido} and cliente = ${nroCliente} and cliente = ${nroRuta}`);
        let [
            [escaneado]
        ] = await connection.execute(arrayQueryEscanOrNoScan.reduce(reducer));
        escaneado = escaneado.sum_ingresada > 0;
        try {
            // obtengo el estado, cli_nom, fecha y vendedor  del pedido 
            dataPedido = await Pedido.findOne({ attributes: ["estado", "cli_nom", "fecha", "vendedor"], where: { pedido: nroPedido, cliente: nroCliente, ruta: nroRuta } });
        } catch (error) {

        }

        if (dataPedido !== null) {
            // Obtengo codigo, descripcion, cantidad y secuencia de producto del pedido
            if (escaneado) {
                itemsPedidoDB = await Pedido.findAll({ attributes: ["producto", "pro_nom", "precio", "ingresada", "secuencia"], where: { pedido: nroPedido, cliente: nroCliente, ruta: nroRuta }, order: ["pro_nom"] });

            } else {
                itemsPedidoDB = await Pedido.findAll({ attributes: ["producto", "pro_nom", "precio", "cantidad", "secuencia"], where: { pedido: nroPedido, cliente: nroCliente, ruta: nroRuta }, order: ["pro_nom"] });

            }
            itemsPedidoDB.forEach(item => itemsPedidoView.push(item.dataValues))

            // Obtengo todos los productos. {codigo , descripcion, precio}
            productosDB = await Producto.findAll();
            for (let i = 0; i < productosDB.length; i++) {
                dataProducts.push(productosDB[i].dataValues);

            }



            res.render('detallepedido', { data: itemsPedidoView, dataProducts: dataProducts, nroPedido: nroPedido, nroCliente: nroCliente, escaneado: escaneado, estadoPedido: dataPedido.dataValues.estado, fechaPedido: dataPedido.dataValues.fecha, clientePedido: dataPedido.dataValues.cli_nom, vendedorPedido: dataPedido.dataValues.vendedor, rutaPedido: nroRuta, /* datos req.query => */ pedido: pedido, cliente: cliente, vendedor: vendedor, estado: estado, ruta, fecha_desde, fecha_hasta })
        } else {
            res.render('pedidosremotossearch', { typeMsg: typeMsg, message: message })
        }

    },

    // Metodo que trae todos los pedidos
    getPedidos: async(req, res) => {

        const { pedido, cliente, vendedor, estado, ruta, fecha_desde, fecha_hasta } = req.query;
        let message = "";
        let conditionQuery = "";
        if (pedido == "" && cliente == "" && vendedor == "default" && estado == "default" && ruta == "default" && fecha_desde == "" && fecha_hasta == "") {
            message = "Atencion! debe ingresar al menos un criterio de busqueda";
            res.render('pedidosremotossearch', { typeMsg: typeMessage.warning, message: message });
        } else {
            if (pedido == "") {
                if (cliente == "") {
                    if (vendedor == "default") {
                        if (ruta == "default") {
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
                                conditionQuery = (` ruta = ${ruta} and estado = '${estado}' and fecha between '${fecha_desde}' and '${fecha_hasta}' `);
                            } else {
                                if (estado !== "default" && fecha_desde !== "") {
                                    conditionQuery = (` ruta = ${ruta} and estado = '${estado}' and fecha >= '${fecha_desde}' `);
                                } else {
                                    if (estado !== "default" && fecha_hasta !== "") {
                                        conditionQuery = (` ruta = ${ruta} and estado = '${estado}' and fecha <= '${fecha_hasta}' `);
                                    } else {
                                        if (estado !== "default") {
                                            conditionQuery = (` ruta = ${ruta} and estado = '${estado}' `);
                                        } else {
                                            if (fecha_desde !== "" && fecha_hasta !== "") {
                                                conditionQuery = (` ruta = ${ruta} and fecha between '${fecha_desde}' and '${fecha_hasta}' `);
                                            } else {
                                                if (fecha_desde !== "") {
                                                    conditionQuery = (` ruta = ${ruta} and fecha >= '${fecha_desde}' `);
                                                } else {
                                                    if (fecha_hasta !== "") {
                                                        conditionQuery = (` ruta = ${ruta} and fecha <= '${fecha_hasta}' `);
                                                    } else {
                                                        conditionQuery = (` ruta = ${ruta} `);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    } else {
                        if (estado !== "default" && ruta !== "default" && fecha_desde !== "" && fecha_hasta !== "") {
                            conditionQuery = (` vendedor = ${vendedor} and estado = '${estado}' and ruta = ${ruta} and fecha between '${fecha_desde}' and '${fecha_hasta}' `);
                        } else {
                            if (estado !== "default" && ruta !== "default" && fecha_desde !== "") {
                                conditionQuery = (` vendedor = ${vendedor} and estado = '${estado}' and ruta = ${ruta} and fecha >= '${fecha_desde}' `);
                            } else {
                                if (estado !== "default" && ruta !== "default" && fecha_hasta !== "") {
                                    conditionQuery = (` vendedor = ${vendedor} and estado = '${estado}' and ruta = ${ruta} and fecha <= '${fecha_hasta}' `);
                                } else {
                                    if (estado !== "default" && ruta !== "default") {
                                        conditionQuery = (` vendedor = ${vendedor} and estado = '${estado}' and ruta = ${ruta} `);
                                    } else {
                                        if (estado !== "default" && fecha_desde !== "" && fecha_hasta !== "") {
                                            conditionQuery = (` vendedor = ${vendedor} and estado = '${estado}'  and fecha between '${fecha_desde}' and '${fecha_hasta}' `);
                                        } else {
                                            if (estado !== "default" && fecha_desde !== "") {
                                                conditionQuery = (` vendedor = ${vendedor} and estado = '${estado}' and fecha >= '${fecha_desde}' `);
                                            } else {
                                                if (estado !== "default" && fecha_hasta !== "") {
                                                    conditionQuery = (` vendedor = ${vendedor} and fecha <= '${fecha_hasta}' `);
                                                } else {
                                                    if (estado !== "default") {
                                                        conditionQuery = (` vendedor = ${vendedor} and estado = '${estado}' `);
                                                    } else {
                                                        if (ruta !== "default" && fecha_desde !== "" && fecha_hasta !== "") {
                                                            conditionQuery = (` vendedor = ${vendedor} `);
                                                            // conditionQuery = (` vendedor = ${vendedor} and ruta = '${ruta}' and fecha between '${fecha_desde}' and '${fecha_hasta}' `);
                                                        } else {
                                                            if (ruta !== "default" && fecha_desde !== "") {
                                                                conditionQuery = (` vendedor = ${vendedor} and ruta = '${ruta}' and fecha >= '${fecha_desde}' `);
                                                            } else {
                                                                if (ruta !== "default" && fecha_hasta !== "") {
                                                                    conditionQuery = (` vendedor = ${vendedor} and ruta = '${ruta}' and fecha <= '${fecha_hasta}' `);
                                                                } else {
                                                                    if (ruta !== "default") {
                                                                        conditionQuery = (` vendedor = ${vendedor} and ruta = ${ruta} `);
                                                                    } else {
                                                                        if (fecha_desde !== "" && fecha_hasta !== "") {
                                                                            conditionQuery = (` vendedor = ${vendedor} and fecha between '${fecha_desde}' and '${fecha_hasta}' `);
                                                                        } else {
                                                                            if (fecha_desde !== "") {
                                                                                conditionQuery = (` vendedor = ${vendedor} and fecha >='${fecha_desde}' `);
                                                                            } else {
                                                                                if (fecha_hasta !== "") {
                                                                                    conditionQuery = (` vendedor = ${vendedor} and fecha <= '${fecha_hasta}' `);
                                                                                } else {
                                                                                    conditionQuery = (` vendedor = ${vendedor} `);
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
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
                                            await renderPagesOrMessage(req.body, res, conditionQuery, 'Atencion! No existen pedidos para los datos ingresados');

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

            message = "Atencion! No existen pedidos para los datos ingresados";
            renderPagesOrMessage(req.query, res, conditionQuery, typeMessage.warning, message);
        }

    },
    nextOrBeforePage: async(req, res) => {
        let { next, cant_ped, offset, limit, currentPage, pages, conditionQuery, pedido, cliente, vendedor, estado, ruta, fecha_desde, fecha_hasta } = req.query;
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
        return res.render('pedidosremotospages', { data: data[0], cant_ped, offset, limit, currentPage, pages, conditionQuery, pedido, cliente, vendedor, estado, ruta, fecha_desde, fecha_hasta });

    },

    updatePedido: async(req, res) => {

        // conexion a mysql2
        const connection = await connect();

        Pedido.removeAttribute('id');
        Producto.removeAttribute('id');
        const { nroPedido, nroCliente } = req.params;
        const { producto, pro_nom, precio, cantidad, estado, estado_modificado, item_modificado, item_eliminado, item_agregado, item_secuencia } = req.body;
        const { escaneado, fecha, cli_nom, ruta, vendedor } = req.query;
        // Obtengo los estados arrayEstados = [ 'A', 'G', 'I', 'X' ] de la BD
        const estados = await Estado.findAll();
        const arrayEstados = [];
        let message = '';
        estados.forEach(element => {
            arrayEstados.push(element.dataValues.estado);
        })

        // Comienzo de las verificaciones de datos

        // Si tiene un solo item o tiene varios
        if (producto !== '' && producto > 0 && pro_nom !== '' && precio !== '' && cantidad !== '' && cantidad > 0 && arrayEstados.includes(estado)) {
            if (escaneado == 'true') {
                await Pedido.update({ estado: estado, producto: producto, pro_nom: pro_nom, precio: precio, ingresada: cantidad }, { where: { pedido: nroPedido, cliente: nroCliente } });
            } else {
                await Pedido.update({ estado: estado, producto: producto, pro_nom: pro_nom, precio: precio, cantidad: cantidad }, { where: { pedido: nroPedido, cliente: nroCliente } });
            }

        } else {
            if ((typeof producto == 'object' && producto.length > 0) && (typeof pro_nom == 'object' && pro_nom.length > 0) && (typeof precio == 'object' && precio.length > 0) && (typeof cantidad == 'object' && cantidad.length > 0) && arrayEstados.includes(estado)) {
                const productosModificados = [];
                const itemsAgregados = [];
                //Selecciono los productos agregados, modificados y eliminados del pedido

                for (let i = 0; i < producto.length; i++) {
                    if (item_agregado[i] == '1') {
                        itemsAgregados.push({ producto: producto[i], pro_nom: pro_nom[i], precio: precio[i], cantidad: cantidad[i], secuencia: item_secuencia[i] }); //BD
                    } else {
                        if (item_modificado[i] == '1') {
                            productosModificados.push({ producto: producto[i], pro_nom: pro_nom[i], precio: precio[i], cantidad: cantidad[i], secuencia: item_secuencia[i] });
                        }
                    }

                }
                // recupero datos del cliente y el producto en la BD
                const dataCliente = await connection.execute(`select tipo, lista, condicion from pedidosremotos where cliente = ${nroCliente} order by fecha desc limit 1`);
                const dataProductos = [];
                for (const item of itemsAgregados) { // DATOS DEL PRODUCTO
                    dataProductos.push(await connection.execute(`select unidades, internos from pedidosremotos where producto = ${item.producto} order by fecha desc limit 1`))
                }


                if (escaneado == 'true') {
                    // Grabo las modificaciones del pedido
                    for (let i = 0; i < productosModificados.length; i++) {
                        await Pedido.update({ estado: estado, producto: productosModificados[i].producto, pro_nom: productosModificados[i].pro_nom, precio: productosModificados[i].precio, ingresada: productosModificados[i].cantidad }, { where: { pedido: nroPedido, cliente: nroCliente, secuencia: productosModificados[i].secuencia } });
                    }
                    // Agrego los items nuevos a la BD
                    for (let i = 0; i < itemsAgregados.length; i++) {

                        await Pedido.create({ talonario: 1, pedido: nroPedido, fecha: fecha, cliente: nroCliente, tipo: dataCliente[0].tipo, producto: itemsAgregados[i].producto, bulto: 0, unidades: dataProductos[i][0].unidades, precio: itemsAgregados[i].precio, cantidad: itemsAgregados[i].cantidad, precio: dataProductos[i][0].precio, secuencia: itemsAgregados[i].secuencia, estado: estado, cli_nom: cli_nom, pro_nom: itemsAgregados[i].pro_nom, lista: dataProductos[i][0].lista, condicion: dataProductos[i][0].condicion, ruta: ruta, internos: dataProductos[i][0].internos, ingresada: itemsAgregados[i].cantidad, info: 0, vendedor: vendedor });
                    }
                } else {
                    // Grabo las modificaciones del pedido
                    for (let i = 0; i < productosModificados.length; i++) {

                        await Pedido.update({ estado: estado, producto: productosModificados[i].producto, pro_nom: productosModificados[i].pro_nom, precio: productosModificados[i].precio, cantidad: productosModificados[i].cantidad }, { where: { pedido: nroPedido, cliente: nroCliente, secuencia: productosModificados[i].secuencia } });
                    }

                    // Agrego los items nuevos a la BD
                    for (let i = 0; i < itemsAgregados.length; i++) {
                        await Pedido.create({ talonario: 1, pedido: nroPedido, fecha: fecha, cliente: nroCliente, tipo: dataCliente[0].tipo, producto: itemsAgregados[i].producto, bulto: 0, unidades: dataProductos[i][0].unidades, cantidad: itemsAgregados[i].cantidad, precio: itemsAgregados[i].precio, secuencia: itemsAgregados[i].secuencia, estado: estado, cli_nom: cli_nom, pro_nom: itemsAgregados[i].pro_nom, lista: dataProductos[i][0].lista, condicion: dataProductos[i][0].condicion, ruta: ruta, internos: dataProductos[i][0].internos, ingresada: 0, info: 0, vendedor: vendedor });
                    }
                }
                // cambio el estado del pedido si asi lo requiere el usuario
                if (estado_modificado == 1) {
                    await Pedido.update({ estado: estado }, { where: { pedido: nroPedido, cliente: nroCliente } });
                }

            }
        }

        res.render('pedidosremotossearch', { message: message });
    },

    deletePedido: async(req, res) => {

        Pedido.removeAttribute('id');

        let message = "";
        const { nroPedido, nroCliente, nroRuta } = req.params;

        const pedidoEliminado = await Pedido.destroy({ where: { pedido: nroPedido, cliente: nroCliente, ruta: nroRuta } });

        if (pedidoEliminado > 0) {
            message = `El pedido Nro: ${nroPedido} se ha eliminado con exito!`;
            res.render('pedidosremotossearch', { typeMsg: typeMessage.success, message: message });
        } else {
            message = `El pedido Nro: ${nroPedido} NO se ha eliminado. Algo salio mal!`;
            res.render('pedidosremotossearch', { typeMsg: typeMessage.danger, message: message });
        }

    },

    deleteItemPedido: async(req, res) => {
        Pedido.removeAttribute('id');
        Producto.removeAttribute('id');
        const { nroPedido, nroCliente, codProducto, nroSecuencia, nroRuta } = req.params;
        const { pedido, cliente, vendedor, estado, ruta, fecha_desde, fecha_hasta, escaneado } = req.query;
        const itemsPedidoView = [];
        const dataProducts = [];
        let itemsPedidoDB, productosDB, dataPedido;
        let message1 = "";
        let message2 = "";


        const itemEliminado = await Pedido.destroy({ where: { pedido: nroPedido, cliente: nroCliente, producto: codProducto, secuencia: nroSecuencia, ruta: nroRuta } });
        if (itemEliminado > 0) {
            message1 = `El Producto Nro: ${codProducto} se ha eliminado con exito!`;
        } else {
            message2 = `El Producto Nro: ${codProducto} NO se a podido eliminar!`;
        }

        try {
            // obtengo el estado, cli_nom, fecha, vendedor y ruta del pedido 
            dataPedido = await Pedido.findOne({ attributes: ["estado", "cli_nom", "fecha", "vendedor"], where: { pedido: nroPedido, cliente: nroCliente, ruta: nroRuta } });
        } catch (error) {

        }

        if (dataPedido !== null) {
            // Obtengo codigo, descripcion, cantidad y secuencia de producto del pedido
            if (escaneado == 'true') {
                itemsPedidoDB = await Pedido.findAll({ attributes: ["producto", "pro_nom", "precio", "ingresada", "secuencia"], where: { pedido: nroPedido, cliente: nroCliente, ruta: nroRuta }, order: ["pro_nom"] });

            } else {
                itemsPedidoDB = await Pedido.findAll({ attributes: ["producto", "pro_nom", "precio", "cantidad", "secuencia"], where: { pedido: nroPedido, cliente: nroCliente, ruta: nroRuta }, order: ["pro_nom"] });

            }
            itemsPedidoDB.forEach(item => itemsPedidoView.push(item.dataValues))

            // Obtengo todos los productos. {codigo , descripcion}
            productosDB = await Producto.findAll();
            for (let i = 0; i < productosDB.length; i++) {
                dataProducts.push(productosDB[i].dataValues);
            }

            res.render('detallepedido', { typeMsg: typeMessage.success, message: message1, data: itemsPedidoView, dataProducts: dataProducts, nroPedido: nroPedido, nroCliente: nroCliente, escaneado: escaneado, estadoPedido: dataPedido.dataValues.estado, fechaPedido: dataPedido.dataValues.fecha, clientePedido: dataPedido.dataValues.cli_nom, vendedorPedido: dataPedido.dataValues.vendedor, rutaPedido: nroRuta, /* datos req.query => */ pedido: pedido, cliente: cliente, vendedor: vendedor, estado: estado, ruta, fecha_desde, fecha_hasta })
        } else {
            res.render('pedidosremotossearch', { typeMsg: typeMessage.success, message: message2 })
        }
    }
}