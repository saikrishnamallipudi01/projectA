const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    name: String,
    price: Number,
    estimatedTime: String,
    image: String,
    description: String,
    includes: [String],
    servicePoints: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('Service', serviceSchema);
