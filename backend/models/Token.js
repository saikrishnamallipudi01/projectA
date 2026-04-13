const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    code: { type: String, unique: true },
    name: String,
    phone: String,
    address: String,
    note: String,
    status: {
        type: String,
        enum: ['waiting', 'inprogress', 'confirmed', 'done'],
        default: 'waiting',
    },
    assignedServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    assignedTechnician: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician' },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    creatorName: String,
    linkedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Token', tokenSchema);
