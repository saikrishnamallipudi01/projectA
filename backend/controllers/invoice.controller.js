const Booking = require('../models/Booking');
const PDFDocument = require('pdfkit');
const fs = require('fs');

exports.getInvoiceByToken = async (req, res) => {
    try {
        const { tokenCode } = req.params;
        const bookings = await Booking.find({ tokenCode })
            .populate('technicianId', 'name')
            .sort({ bookingDate: -1 });
        
        if (!bookings.length) return res.status(404).json({ message: 'No invoices found for this token' });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getMyInvoices = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id })
            .populate('technicianId', 'name')
            .sort({ bookingDate: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getUserInvoices = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.params.userId })
            .populate('technicianId', 'name')
            .sort({ bookingDate: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.downloadInvoicePDF = async (req, res) => {
    try {
        const bookingId = req.params.bookingId || req.query.bookingId;
        const booking = await Booking.findById(bookingId)
            .populate('userId', 'name email phone tokensBalance')
            .populate('technicianId', 'name');

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${booking._id}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(25).text('ATNIS INVOICE', 100, 50);
        doc.fontSize(10).text('ATNIS Technical Solutions', 400, 50, { align: 'right' });
        doc.text('Aditya Degree & PG College, Kakinada', 400, 65, { align: 'right' });
        doc.text('GST: 37AABCA1234Z1ZK', 400, 80, { align: 'right' });

        // Line
        doc.moveTo(100, 100).lineTo(500, 100).stroke();

        // Bill To
        doc.fontSize(12).text('BILL TO:', 100, 120, { underline: true });
        doc.fontSize(10).text(`Name: ${booking.customerName || booking.userId?.name || 'Guest'}`, 100, 140);
        doc.text(`Phone: ${booking.customerPhone || booking.userId?.phone || '—'}`, 100, 155);
        if (booking.userId) {
            doc.text(`Token Balance: ${booking.userId.tokensBalance || 0} pts`, 100, 170);
        }

        // Invoice Details
        doc.text(`Invoice Date: ${new Date().toLocaleDateString('en-IN')}`, 400, 120, { align: 'right' });
        doc.text(`Booking ID: ${booking._id}`, 400, 135, { align: 'right' });
        doc.text(`Source: ${booking.source === 'token' ? 'Token/ServicePoint' : 'Self'}`, 400, 150, { align: 'right' });

        // Table Header
        doc.rect(100, 200, 400, 20).fill('#f1f5f9');
        doc.fillColor('#0f172a').fontSize(10).text('Service', 110, 205);
        doc.text('Category', 250, 205);
        doc.text('Technician', 350, 205);
        doc.text('Price', 450, 205, { align: 'right' });

        // Table Row
        doc.fillColor('#475569').text(booking.serviceName || '—', 110, 230);
        doc.text(booking.categoryName || '—', 250, 230);
        doc.text(`${booking.technicianId?.name || '—'} ${booking.technicianId?.phone ? `(${booking.technicianId.phone})` : ''}`, 350, 230);
        doc.text(`₹ ${booking.price?.toLocaleString('en-IN') || 0}`, 450, 230, { align: 'right' });

        // Footer
        doc.fontSize(12).fillColor('#0ea5e9').text(`Total Payable: ₹ ${booking.price?.toLocaleString('en-IN') || 0}`, 350, 280, { align: 'right' });

        doc.fontSize(8).fillColor('#94a3b8').text('Reg No: 2481851062 | SUC No: 2488560013', 100, 700, { align: 'center' });

        doc.end();
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
