const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

router.get('/stats', verifyToken, requireAdmin, adminController.getStats);
router.get('/revenue', verifyToken, requireAdmin, adminController.getRevenueByCategory);
router.get('/bookings', verifyToken, requireAdmin, adminController.getAllBookings);
router.post('/staff', verifyToken, requireAdmin, adminController.createStaffAccount);

module.exports = router;
