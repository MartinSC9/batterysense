const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Rutas públicas
router.post('/check-email', authController.checkEmail);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);

// Rutas protegidas
router.get('/me', auth, authController.me);
router.post('/logout', auth, authController.logout);

module.exports = router;
