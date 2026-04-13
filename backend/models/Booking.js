const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician' },
    serviceName: String,
    categoryName: String,
    categoryIcon: String,
    price: Number, // This will be the final price
    originalPrice: Number,
    discountAmount: { type: Number, default: 0 },
    couponCode: String,
    slot: String,
    serviceImage: String,
    step: { type: Number, default: 1, min: 1, max: 5 },
    source: { type: String, enum: ['self', 'token'], default: 'self' },
    tokenCode: String,
    customerName: String,
    customerPhone: String,
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    creatorName: String,
    riseLocation: String,
    address: String,
    workDescription: String,
    invoiceNumber: { type: String, unique: true, sparse: true },
    progressNotes: [{
        note: String,
        timestamp: { type: Date, default: Date.now }
    }],
    bookingDate: { type: Date, default: Date.now },
    completedAt: Date,
    isInvoiceGenerated: { type: Boolean, default: false },
    invoiceDate: Date,
});

module.exports = mongoose.model('Booking', bookingSchema);
