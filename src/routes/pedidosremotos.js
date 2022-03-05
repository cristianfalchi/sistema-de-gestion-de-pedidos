const { Router } = require('express');
const router = Router();
const pedidosCtr = require('../controllers/pedidos.controller');

// '/pedidos'
router.get('/', pedidosCtr.homePedidos);

// '/pedidos/page'
router.get('/page', pedidosCtr.getPedidos);

//  '/pedidos/:page'
router.get('/page/:nroPage', pedidosCtr.nextOrBeforePage);

// '/pedidos/edit/:nroPedido/:nroCliente'
router.get('/edit/:nroPedido/:nroCliente/:nroRuta', pedidosCtr.getOnePedido)

router.post('/update/:nroPedido/:nroCliente', pedidosCtr.updatePedido);

router.get('/delete/:nroPedido/:nroCliente/:nroRuta', pedidosCtr.deletePedido);

router.get('/delete/item/:nroPedido/:nroCliente/:codProducto/:nroSecuencia/:nroRuta', pedidosCtr.deleteItemPedido);


module.exports = router;