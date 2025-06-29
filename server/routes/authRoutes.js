// backend/routes/authRoutes.js

const express = require('express');
const {
    register,
    login,
    getMe,
    updateDetails,
    updatePassword,
    logout
} = require('../controllers/authController');

const { protect, authorize } = require('../middleware/auth'); // Import middleware

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe); // Route cần bảo vệ
router.put('/updatedetails', protect, updateDetails); // Route cần bảo vệ
router.put('/updatepassword', protect, updatePassword); // Route cần bảo vệ
router.get('/logout', protect, logout); // Route cần bảo vệ

// Ví dụ một route chỉ dành cho admin
// router.get('/admin-only', protect, authorize('admin'), (req, res) => {
//     res.status(200).json({ success: true, message: 'Welcome Admin!' });
// });

module.exports = router;