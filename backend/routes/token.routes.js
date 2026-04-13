const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/token.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireAdmin, requireStaff } = require('../middleware/role.middleware');

router.post('/generate', tokenController.generateToken);
router.get('/check/:code', tokenController.checkTokenStatus);

router.get('/', verifyToken, requireStaff, tokenController.getAllTokens);
router.put('/:code/status', verifyToken, requireStaff, tokenController.updateTokenStatus);
router.put('/:code/confirm', verifyToken, requireAdmin, tokenController.confirmBookingFromToken);
router.delete('/:code', verifyToken, requireAdmin, tokenController.deleteToken);

module.exports = router;
