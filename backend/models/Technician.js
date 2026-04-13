const mongoose = require('mongoose');

const technicianSchema = new mongoose.Schema({
    name: String,
    email: { type: String, sparse: true },
    role: String,
    phone: String,
    location: String,
    coordinates: { lat: Number, lng: Number },
    distanceKm: Number,
    rating: { type: Number, default: 5.0 },
    totalReviews: { type: Number, default: 0 },
    experience: String,
    status: { type: String, enum: ['available', 'busy'], default: 'available' },
    certifications: [String],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    avatar: String, // Cloudinary URL
    bio: String,
});

module.exports = mongoose.model('Technician', technicianSchema);
