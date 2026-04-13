const Service = require('../models/Service');

exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.find().populate('categoryId', 'name icon color');
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).populate('categoryId');
        if (!service) return res.status(404).json({ message: 'Service not found' });
        res.json(service);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getServicesByCategory = async (req, res) => {
    try {
        const services = await Service.find({ categoryId: req.params.catId });
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.createService = async (req, res) => {
    try {
        console.log('[Service Controller] Creating service. Body:', req.body);
        console.log('[Service Controller] File:', req.file);
        const serviceData = { ...req.body };
        if (req.file) {
            serviceData.image = `/uploads/services/${req.file.filename}`;
            console.log('[Service Controller] Image set to:', serviceData.image);
        }
        // Normalize includes to array if it comes as a string
        if (serviceData.includes && typeof serviceData.includes === 'string') {
            serviceData.includes = [serviceData.includes];
        }
        const service = new Service(serviceData);
        await service.save();
        res.status(201).json(service);
    } catch (err) {
        console.error('[Service Controller] Create Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.updateService = async (req, res) => {
    try {
        console.log('[Service Controller] Updating service:', req.params.id);
        console.log('[Service Controller] Body:', req.body);
        console.log('[Service Controller] File:', req.file);
        const updateData = { ...req.body };
        
        // Safety: Don't let an empty 'image' field in the body overwrite the database
        delete updateData.image;

        if (req.file) {
            updateData.image = `/uploads/services/${req.file.filename}`;
            console.log('[Service Controller] Image updated to:', updateData.image);
        }
        // Normalize includes to array if it comes as a string
        if (updateData.includes && typeof updateData.includes === 'string') {
            updateData.includes = [updateData.includes];
        }
        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );
        console.log('[Service Controller] Update Success');
        res.json(updatedService);
    } catch (err) {
        console.error('[Service Controller] Update Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.deleteService = async (req, res) => {
    try {
        await Service.findByIdAndDelete(req.params.id);
        res.json({ message: 'Service deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
