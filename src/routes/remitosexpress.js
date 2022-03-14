const { Router } = require('express');
const router = Router();
const remitosCtr = require('../controllers/remitos.controller');

// '/remitos'
router.get('/', remitosCtr.homeRemitos);

// '/remitos/page'
router.post('/page', remitosCtr.getRemitos);

//  '/remitos/:page'
router.get('/page/:nroPage', remitosCtr.nextOrBeforePage);

router.get('/edit/:nroPedido/:nroCliente', remitosCtr.getOneRemito)

router.post('/update/:nroPedido/:nroCliente', remitosCtr.updateRemito);

router.get('/delete/:nroPedido/:nroCliente', remitosCtr.deleteRemito);


module.exports = router;