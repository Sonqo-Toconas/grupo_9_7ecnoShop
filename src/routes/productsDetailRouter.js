const express = require('express');
const router = express.Router();

const productDetailController = require('../controllers/productDetailController');

router.get('/', productDetailController.producto);


module.exports = router