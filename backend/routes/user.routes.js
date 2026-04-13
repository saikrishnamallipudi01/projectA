const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

router.get('/', verifyToken, requireAdmin, userController.getAllUsers);
router.get('/:id', verifyToken, userController.getUserProfile);
router.put('/:id', verifyToken, userController.updateProfile);
router.delete('/:id', verifyToken, requireAdmin, userController.deleteUser);

module.exports = router;
