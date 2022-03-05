const { Router } = require('express');
const router = Router();
const remitosCtr = require('../controllers/remitos.controller');

// '/remitos'
router.get('/', remitosCtr.homeRemitos);
// '/remitos/search'
router.get('/search', remitosCtr.getRemitos);




module.exports = router;