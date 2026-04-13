const Notification = require('../models/Notification');

exports.getMyNotifications = async (req, res) => {
    try {
        const query = {
            $or: [
                { recipientId: req.user.id },
                { recipientRole: req.user.role }
            ]
        };
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(80);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const query = {
            isRead: false,
            $or: [
                { recipientId: req.user.id },
                { recipientRole: req.user.role }
            ]
        };
        const count = await Notification.countDocuments(query);
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        
        notification.isRead = true;
        await notification.save();
        
        res.json({ message: 'Marked as read', notification });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const query = {
            $or: [
                { recipientId: req.user.id },
                { recipientRole: req.user.role }
            ]
        };
        await Notification.updateMany(query, { isRead: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        
        // Only allow the recipient to delete their own notification
        const isOwnerById = notification.recipientId && notification.recipientId.toString() === req.user.id;
        const isOwnerByRole = notification.recipientRole === req.user.role;
        if (!isOwnerById && !isOwnerByRole) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        await notification.deleteOne();
        res.json({ message: 'Notification deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
