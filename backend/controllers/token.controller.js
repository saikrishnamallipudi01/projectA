const Token = require('../models/Token');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const generateUniqueTokenCode = require('../utils/tokenCodeGen');

exports.generateToken = async (req, res) => {
    try {
        const { name, phone, address, note } = req.body;
        const code = await generateUniqueTokenCode();

        // Check if phone matches 10 digits
        const cleanPhone = phone.replace(/\D/g, '');
        
        // Link with existing user if phone matches
        const linkedUser = await User.findOne({ phone: cleanPhone });

        const token = new Token({ 
            code, 
            name, 
            phone: cleanPhone, 
            address, 
            note,
            creatorId: req.user?.id,
            creatorName: req.user?.name || 'Self/Guest',
            linkedUserId: linkedUser?._id
        });
        await token.save();

        res.status(201).json(token);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.checkTokenStatus = async (req, res) => {
    try {
        const token = await Token.findOne({ code: req.params.code })
            .populate('assignedServices', 'name price image categoryId')
            .populate('assignedTechnician', 'name avatar distanceKm status');

        if (!token) return res.status(404).json({ message: 'Token not found' });
        res.json(token);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getAllTokens = async (req, res) => {
    try {
        const tokens = await Token.find().sort({ createdAt: -1 });
        res.json(tokens);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.updateTokenStatus = async (req, res) => {
    try {
        const token = await Token.findOneAndUpdate(
            { code: req.params.code },
            { status: req.body.status },
            { new: true }
        );
        if (!token) return res.status(404).json({ message: 'Token not found' });
        res.json(token);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.confirmBookingFromToken = async (req, res) => {
    try {
        const { serviceIds, technicianId, manualPrice, slot, customerName, customerPhone, customerAddress } = req.body;
        let token = await Token.findOne({ code: req.params.code });
        if (!token) return res.status(404).json({ message: 'Token not found' });

        if (!serviceIds || serviceIds.length === 0) {
            return res.status(400).json({ message: 'At least one service is required' });
        }

        const services = await Service.find({ _id: { $in: serviceIds } }).populate('categoryId');
        if (services.length === 0) {
            return res.status(400).json({ message: 'Selected services are invalid or not found' });
        }

        const primaryService = services[0];
        if (!primaryService.categoryId) {
            return res.status(500).json({ message: 'Service category data is missing. Please contact admin.' });
        }
        
        // Calculate total price from services if manualPrice is not provided
        const calculatedPrice = services.reduce((sum, s) => sum + (s.price || 0), 0);
        const finalPrice = (manualPrice !== undefined && manualPrice !== '') ? Number(manualPrice) : calculatedPrice;
        const techId = (technicianId && technicianId !== '') ? technicianId : null;

        const booking = new Booking({
            userId: token.linkedUserId || null,
            serviceId: primaryService._id,
            categoryId: primaryService.categoryId._id,
            technicianId: techId,
            serviceName: services.map(s => s.name).join(', '),
            categoryName: primaryService.categoryId.name,
            categoryIcon: primaryService.categoryId.icon,
            price: finalPrice,
            serviceImage: primaryService.image,
            source: 'token',
            tokenCode: token.code,
            customerName: customerName || token.name,
            customerPhone: (customerPhone || token.phone).replace(/\D/g, ''),
            address: customerAddress || token.address,
            slot: slot || '',
            creatorId: token.creatorId,
            creatorName: token.creatorName,
            riseLocation: token.creatorName === 'Self/Guest' ? 'Guest Web Portal' : `Service Point: ${token.creatorName}`,
            step: 3 // 'Assigned' step
        });

        await booking.save();

        token.assignedServices = serviceIds;
        token.assignedTechnician = technicianId;
        token.bookingId = booking._id;
        token.status = 'confirmed';
        await token.save();

        res.json({ message: 'Token booking confirmed', token, booking });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.deleteToken = async (req, res) => {
    try {
        const token = await Token.findOne({ code: req.params.code });
        if (!token) return res.status(404).json({ message: 'Token not found' });

        await token.deleteOne();
        res.json({ message: 'Token deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
