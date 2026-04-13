const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // slug e.g. "networking"
    name: { type: String, required: true },
    icon: String,
    color: String,
    image: String, // Cloudinary URL
    tagline: String,
    order: Number,
});

module.exports = mongoose.model('Category', categorySchema);
