const express = require('express');
const { processData, processPayments, fundsPerAccountReport, fundsPerBranchReport, paymentsStatus } = require('../controllers/controller');
const router = express.Router();

router.route('/processData').post(processData)

router.route('/processPayments').post(processPayments)

router.route('/fundsPerAccountReport').get(fundsPerAccountReport)

router.route('/fundsPerBranchReport').get(fundsPerBranchReport)

router.route('/paymentStatus').get(paymentsStatus)

module.exports = router