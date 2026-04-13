const User = require('../models/User');
const Booking = require('../models/Booking');
const Token = require('../models/Token');
const Service = require('../models/Service');

exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const totalTokens = await Token.countDocuments();

        const revenueAgg = await Booking.aggregate([
            { $group: { _id: null, totalRevenue: { $sum: '$price' } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

        res.json({ totalUsers, totalBookings, totalTokens, totalRevenue });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getRevenueByCategory = async (req, res) => {
    try {
        const revenue = await Booking.aggregate([
            {
                $group: {
                    _id: '$categoryName',
                    revenue: { $sum: '$price' },
                },
            },
        ]);
        res.json(revenue);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'name email phone')
            .populate('technicianId', 'name status');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const bcrypt = require('bcryptjs');

exports.createStaffAccount = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;

        if (!['ServicePoint', 'Customer'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role for this endpoint.' });
        }

        // Check if user already exists
        const searchCond = [];
        if (email) searchCond.push({ email });
        if (phone) searchCond.push({ phone });

        if (searchCond.length > 0) {
            const existingUser = await User.findOne({ $or: searchCond });
            if (existingUser) return res.status(400).json({ message: 'User with this email or phone already exists' });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newEmail = email || `user_${Date.now()}@atnis.com`;

        const user = new User({
            name,
            email: newEmail,
            phone,
            password: hashedPassword,
            role
        });
        await user.save();

        res.status(201).json({ message: 'Account created successfully', user: { _id: user._id, name: user.name, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
