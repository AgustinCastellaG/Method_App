const express = require('express');
const { processData } = require('../controllers/controller');
const router = express.Router();

router.route('/processData').post(processData)

module.exports = router