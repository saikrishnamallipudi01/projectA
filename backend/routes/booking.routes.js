const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

router.post('/', verifyToken, bookingController.createBooking);
router.post('/direct', verifyToken, bookingController.createDirectBooking);
router.get('/my', verifyToken, bookingController.getMyBookings);
router.get('/available', verifyToken, bookingController.getAvailableBookings);
router.get('/', verifyToken, bookingController.getAllBookings);
router.put('/:id/accept', verifyToken, bookingController.acceptBooking);
router.put('/:id/advance', verifyToken, bookingController.advanceStep);
router.put('/:id/progress', verifyToken, bookingController.addProgressNote);
router.put('/:id/reject', verifyToken, bookingController.rejectJob);
router.put('/:id/arriving', verifyToken, bookingController.notifyArriving);
router.put('/:id/details', verifyToken, bookingController.updateBookingDetails);
router.post('/apply-coupon', verifyToken, bookingController.applyCoupon);
router.put('/:id/invoice', verifyToken, bookingController.generateInvoice);
router.delete('/:id/invoice', verifyToken, bookingController.removeFromInvoice);
router.delete('/:id', verifyToken, bookingController.deleteBooking);

module.exports = router;
