const express = require('express');
const router = express.Router();
const technicianController = require('../controllers/technician.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

router.get('/', technicianController.getAllTechnicians);
router.get('/:id', technicianController.getTechnicianById);
router.get('/category/:catId', technicianController.getTechniciansByCategory);

router.post('/', verifyToken, requireAdmin, technicianController.createTechnician);
router.put('/:id', verifyToken, requireAdmin, technicianController.updateTechnician);
router.put('/:id/status', verifyToken, requireAdmin, technicianController.toggleStatus);
router.delete('/:id', verifyToken, requireAdmin, technicianController.deleteTechnician);

module.exports = router;
