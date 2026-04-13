const Technician = require('../models/Technician');

exports.getAllTechnicians = async (req, res) => {
    try {
        const technicians = await Technician.find().sort({ distanceKm: 1 }).populate('categories', 'name icon');
        res.json(technicians);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getTechnicianById = async (req, res) => {
    try {
        const technician = await Technician.findById(req.params.id).populate('categories');
        if (!technician) return res.status(404).json({ message: 'Technician not found' });
        res.json(technician);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getTechniciansByCategory = async (req, res) => {
    try {
        const technicians = await Technician.find({ categories: req.params.catId }).sort({ distanceKm: 1 });
        res.json(technicians);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.createTechnician = async (req, res) => {
    try {
        const { name, email, phone, ...rest } = req.body;

        // Check if user already exists
        if (email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Create User account for the Technician
        let password = req.body.password || '123456'; // Default password if none provided
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newEmail = email || `tech_${Date.now()}@atnis.com`;
        
        const user = new User({
            name,
            email: newEmail,
            phone,
            password: hashedPassword,
            role: 'Technician'
        });
        await user.save();

        const technician = new Technician({ name, email: newEmail, phone, ...rest });
        await technician.save();
        res.status(201).json(technician);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.updateTechnician = async (req, res) => {
    try {
        const updatedTechnician = await Technician.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.json(updatedTechnician);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.toggleStatus = async (req, res) => {
    try {
        const technician = await Technician.findById(req.params.id);
        if (!technician) return res.status(404).json({ message: 'Technician not found' });

        technician.status = technician.status === 'available' ? 'busy' : 'available';
        await technician.save();

        res.json(technician);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.deleteTechnician = async (req, res) => {
    try {
        await Technician.findByIdAndDelete(req.params.id);
        res.json({ message: 'Technician deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
