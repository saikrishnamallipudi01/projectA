const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.get('/category/:catId', serviceController.getServicesByCategory);

router.post('/', verifyToken, requireAdmin, upload.single('image'), serviceController.createService);
router.put('/:id', verifyToken, requireAdmin, upload.single('image'), serviceController.updateService);
router.delete('/:id', verifyToken, requireAdmin, serviceController.deleteService);

module.exports = router;
