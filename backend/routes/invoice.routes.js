const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

router.get('/my', verifyToken, invoiceController.getMyInvoices);
router.get('/guest/:tokenCode', invoiceController.getInvoiceByToken);
router.get('/:userId', verifyToken, requireAdmin, invoiceController.getUserInvoices);
router.get('/pdf/:userId', verifyToken, invoiceController.downloadInvoicePDF);

module.exports = router;
