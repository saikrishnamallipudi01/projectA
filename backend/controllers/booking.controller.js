const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Technician = require('../models/Technician');
const Notification = require('../models/Notification');

const createNotification = async (recipientId, recipientRole, message, bookingId, type = 'general') => {
    try {
        await Notification.create({ recipientId, recipientRole, message, bookingId, type });
    } catch(err) { console.error('Notification error:', err); }
};

const notifyStaff = async (message, bookingId, type = 'general') => {
    await createNotification(null, 'Admin', message, bookingId, type);
    await createNotification(null, 'ServicePoint', message, bookingId, type);
};

const notifyAllTechnicians = async (message, bookingId, type = 'general') => {
    await createNotification(null, 'Technician', message, bookingId, type);
};

exports.createBooking = async (req, res) => {
    try {
        const { serviceId, categoryId, technicianId, source, tokenCode, slot, workDescription, address } = req.body;

        const service = await Service.findById(serviceId).populate('categoryId');
        if (!service) return res.status(404).json({ message: 'Service not found' });

        const booking = new Booking({
            userId: req.user.id,
            serviceId,
            categoryId: service.categoryId._id,
            technicianId: (technicianId && technicianId !== '') ? technicianId : null,
            serviceName: service.name,
            categoryName: service.categoryId.name,
            categoryIcon: service.categoryId.icon,
            price: service.price,
            originalPrice: service.price,
            slot,
            serviceImage: service.image,
            workDescription: workDescription || '',
            address: address || '',
            source: source || 'self',
            tokenCode,
            customerName: req.user.name,
            customerPhone: req.user.phone,
            step: technicianId ? 3 : 1 // Start at 'Assigned' if tech is provided, else 'Pending'
        });

        await booking.save();

        // Notify Admin, ServicePoint, and ALL Technicians about the new booking
        const newBookingMsg = `🆕 New booking from ${req.user.name} for ${service.name} (${service.categoryId.name})${address ? ' · 📍 ' + address : ''}`;
        await notifyStaff(newBookingMsg, booking._id, 'new_booking');
        await notifyAllTechnicians(newBookingMsg, booking._id, 'new_booking');

        res.status(201).json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        if (req.user.role === 'Technician') {
            const tech = await Technician.findOne({ email: req.user.email });
            if (!tech) return res.json([]);
            const bookings = await Booking.find({ technicianId: tech._id })
                .populate('userId', 'name email phone')
                .populate('technicianId', 'name avatar distanceKm phone rating')
                .sort({ bookingDate: -1 });
            return res.json(bookings);
        }

        const bookings = await Booking.find({ 
            $or: [
                { userId: req.user.id },
                { customerPhone: req.user.phone }
            ]
        })
            .populate('technicianId', 'name avatar distanceKm phone rating')
            .sort({ bookingDate: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'name email phone')
            .populate('technicianId', 'name rating phone avatar location')
            .sort({ bookingDate: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.advanceStep = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const isOwner = booking.userId && booking.userId.toString() === req.user.id;
        const isAdmin = req.user.role === 'Admin';
        const isServicePoint = req.user.role === 'ServicePoint';
        const isTechnician = req.user.role === 'Technician';

        if (!isOwner && !isAdmin && !isServicePoint && !isTechnician) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (booking.step < 5) {
            booking.step += 1;

            if (booking.step === 4 && req.user.role === 'Technician') {
                const msg = `Technician ${req.user.name} accepted job #${booking._id.toString().slice(-6).toUpperCase()}`;
                notifyStaff(msg, booking._id);
                if (booking.userId) createNotification(booking.userId, 'Customer', msg, booking._id);
            }

            if (booking.step === 5) {
                booking.completedAt = Date.now();
                
                // Automatically generate invoice
                if (!booking.invoiceNumber) {
                    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                    const random = Math.floor(1000 + Math.random() * 9000);
                    booking.invoiceNumber = `ATNIS-${dateStr}-${random}`;
                }
                booking.isInvoiceGenerated = true;
                booking.invoiceDate = Date.now();

                // Award tokens if there is a userId and serviceId
                if (booking.userId && booking.serviceId) {
                    const service = await Service.findById(booking.serviceId);
                    if (service && service.servicePoints > 0) {
                        await User.findByIdAndUpdate(booking.userId, {
                            $inc: { tokensBalance: service.servicePoints }
                        });
                    }
                }

                const msg = `Job #${booking._id.toString().slice(-6).toUpperCase()} has been completed!`;
                notifyStaff(msg, booking._id);
                if (booking.userId) createNotification(booking.userId, 'Customer', msg, booking._id);
                
                if (booking.userId && booking.isInvoiceGenerated) {
                     createNotification(booking.userId, 'Customer', `Invoice ready for job #${booking._id.toString().slice(-6).toUpperCase()}`, booking._id);
                }
            }
            await booking.save();
        }

        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const isOwner = booking.userId && booking.userId.toString() === req.user.id;
        const isAdmin = req.user.role === 'Admin';
        const isServicePoint = req.user.role === 'ServicePoint';

        if (!isOwner && !isAdmin && !isServicePoint) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await booking.deleteOne();
        res.json({ message: 'Booking deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.generateInvoice = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (req.user.role !== 'Admin' && req.user.role !== 'ServicePoint') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (!booking.invoiceNumber) {
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const random = Math.floor(1000 + Math.random() * 9000);
            booking.invoiceNumber = `ATNIS-${dateStr}-${random}`;
        }

        booking.isInvoiceGenerated = true;
        booking.invoiceDate = Date.now();
        await booking.save();

        if (booking.userId) {
            createNotification(booking.userId, 'Customer', `Invoice ready for job #${booking._id.toString().slice(-6).toUpperCase()}`, booking._id);
        }

        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.addProgressNote = async (req, res) => {
    try {
        const { note, workDescription } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (req.user.role !== 'Admin' && req.user.role !== 'ServicePoint' && req.user.role !== 'Technician') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (workDescription) booking.workDescription = workDescription;
        if (note) {
            booking.progressNotes.push({ note, timestamp: new Date() });
            
            const msg = `Progress update on #${booking._id.toString().slice(-6).toUpperCase()}: ${note}`;
            notifyStaff(msg, booking._id);
            // Customer notification removed here to keep progress notes admin-only
        }

        await booking.save();
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.createDirectBooking = async (req, res) => {
    try {
        const { name, phone, address, serviceIds, technicianId, manualPrice, workDescription, slot } = req.body;
        
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

        const finalPrice = (manualPrice !== undefined && manualPrice !== '') ? Number(manualPrice) : services.reduce((s, x) => s + (x.price || 0), 0);
        const techId = (technicianId && technicianId !== '') ? technicianId : null;

        // Find linked user
        const cleanPhone = (phone || '').replace(/\D/g, '');
        if (!cleanPhone || cleanPhone.length < 10) {
            return res.status(400).json({ message: 'Valid 10-digit phone number is required' });
        }

        const linkedUser = await User.findOne({ phone: cleanPhone });

        const booking = new Booking({
            userId: linkedUser?._id,
            serviceId: primaryService._id,
            categoryId: primaryService.categoryId._id || primaryService.categoryId,
            technicianId: techId,
            serviceName: services.map(s => s.name).join(', '),
            categoryName: primaryService.categoryId.name || 'General',
            categoryIcon: primaryService.categoryId.icon || '🛠',
            price: finalPrice,
            originalPrice: finalPrice,
            serviceImage: primaryService.image,
            source: 'self',
            customerName: name,
            customerPhone: cleanPhone,
            address: address || '',
            slot: slot || '',
            creatorId: req.user.id,
            creatorName: req.user.name,
            riseLocation: `Service Point: ${req.user.name}`,
            workDescription,
            step: 3 // Start at "Assigned"
        });

        await booking.save();
        res.status(201).json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.removeFromInvoice = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (req.user.role !== 'Admin' && req.user.role !== 'ServicePoint') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        booking.isInvoiceGenerated = false;
        booking.invoiceDate = null;
        await booking.save();

        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.updateBookingDetails = async (req, res) => {
    try {
        const { technicianId, manualPrice, discountAmount, couponCode, workDescription } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (req.user.role !== 'Admin' && req.user.role !== 'ServicePoint') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (technicianId !== undefined) booking.technicianId = (technicianId && technicianId !== '') ? technicianId : null;
        if (manualPrice !== undefined && manualPrice !== '') booking.price = Number(manualPrice);
        if (discountAmount !== undefined) booking.discountAmount = Number(discountAmount);
        if (couponCode !== undefined) booking.couponCode = couponCode;
        if (workDescription !== undefined) booking.workDescription = workDescription;

        await booking.save();
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.applyCoupon = async (req, res) => {
    try {
        const { code, price } = req.body;
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
        
        if (!coupon) return res.status(404).json({ message: 'Invalid or inactive coupon' });
        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({ message: 'Coupon expired' });
        }

        let discount = 0;
        if (coupon.type === 'percentage') {
            discount = (price * coupon.value) / 100;
        } else {
            discount = coupon.value;
        }

        res.json({ 
            success: true, 
            discountAmount: discount, 
            finalPrice: Math.max(0, price - discount),
            couponCode: coupon.code
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.rejectJob = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if(!booking) return res.status(404).json({ message: 'Booking not found' });
        
        if(req.user.role !== 'Technician') return res.status(403).json({ message: 'Not authorized' });
        
        const oldTechName = req.user.name;
        booking.technicianId = null;
        booking.step = 1; // Back to Pending/Waiting
        await booking.save();
        
        const msg = `Technician ${oldTechName} REJECTED job #${booking._id.toString().slice(-6).toUpperCase()}. Job is now unassigned.`;
        notifyStaff(msg, booking._id);
        
        res.json(booking);
    } catch(err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.notifyArriving = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if(!booking) return res.status(404).json({ message: 'Booking not found' });
        
        if(req.user.role !== 'Technician') return res.status(403).json({ message: 'Not authorized' });
        
        if(booking.userId) {
            const customerMsg = `Your technician ${req.user.name} is arriving soon! Contact: ${req.user.phone || 'N/A'}`;
            await createNotification(booking.userId, 'Customer', customerMsg, booking._id);
        }
        
        res.json({ message: 'Arriving notification sent to customer', updatedBooking: booking });
    } catch(err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ── GET AVAILABLE BOOKINGS (unassigned, for technicians to claim) ──
exports.getAvailableBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ technicianId: null, step: { $lte: 2 } })
            .populate('userId', 'name email phone address')
            .sort({ bookingDate: -1 });

        // Augment with user address if booking.address is blank
        const enriched = bookings.map(bk => {
            const b = bk.toObject();
            if (!b.address && b.userId?.address) {
                b.address = b.userId.address;
            }
            return b;
        });

        res.json(enriched);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ── ACCEPT BOOKING (atomic first-come-first-served, race-condition safe) ──
exports.acceptBooking = async (req, res) => {
    try {
        if (req.user.role !== 'Technician') {
            return res.status(403).json({ message: 'Only technicians can accept bookings' });
        }

        // Find the technician profile
        const tech = await Technician.findOne({ email: req.user.email });
        if (!tech) return res.status(404).json({ message: 'Technician profile not found' });

        // Atomic update: only assigns if technicianId is still null (race-condition safe)
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, technicianId: null, step: { $lte: 2 } },
            { $set: { technicianId: tech._id, step: 3 } },
            { new: true }
        );

        // If booking is null, it means another technician was faster, or booking doesn't exist
        if (!booking) {
            // Check if booking exists at all
            const existing = await Booking.findById(req.params.id);
            if (!existing) return res.status(404).json({ message: 'Booking not found' });
            // It exists but already assigned
            return res.status(409).json({ message: 'This job has already been accepted by another technician' });
        }

        // Notify Admin & ServicePoint about the acceptance
        const acceptMsg = `✅ Technician ${req.user.name} accepted booking #${booking._id.toString().slice(-6).toUpperCase()} — ${booking.serviceName}`;
        await notifyStaff(acceptMsg, booking._id, 'booking_accepted');

        // Notify ALL technicians (so others know it's taken and their UI updates)
        await notifyAllTechnicians(acceptMsg, booking._id, 'booking_accepted');

        // Notify the customer
        if (booking.userId) {
            const customerMsg = `✅ Your booking for ${booking.serviceName} has been accepted by ${tech.name}! Contact: ${tech.phone || 'N/A'}`;
            await createNotification(booking.userId, 'Customer', customerMsg, booking._id, 'booking_accepted');
        }

        // Return populated booking
        const populated = await Booking.findById(booking._id)
            .populate('technicianId', 'name avatar distanceKm phone rating');

        res.json(populated);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
