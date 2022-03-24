const { Router } = require('express');
const router = Router();
const productosCtr = require('../controllers/productos.controller');

// '/productos'
router.get('/', productosCtr.allProducts);
router.get('/:codCliente', productosCtr.oneProduct);

module.exports = router;