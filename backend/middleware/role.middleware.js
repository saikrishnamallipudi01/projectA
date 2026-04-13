exports.requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'Admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

exports.requireStaff = (req, res, next) => {
    if (req.user?.role !== 'Admin' && req.user?.role !== 'ServicePoint') {
        return res.status(403).json({ message: 'Staff access (Admin/ServicePoint) required' });
    }
    next();
};
