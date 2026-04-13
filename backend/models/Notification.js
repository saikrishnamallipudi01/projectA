const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recipientRole: { type: String, enum: ['Admin', 'ServicePoint', 'Customer', 'Technician'] },
    message: { type: String, required: true },
    type: { type: String, enum: ['new_booking', 'booking_accepted', 'booking_rejected', 'job_completed', 'general'], default: 'general' },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
