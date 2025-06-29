// backend/controllers/authController.js

const User = require('../models/User');
const jwt = require('jsonwebtoken'); // Cần để giải mã token trong một số trường hợp

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Tạo người dùng mới
        const user = await User.create({
            username,
            email,
            password,
            role // Có thể để admin tạo user với role hoặc chỉ định default
        });

        // Tạo token
        const token = user.getSignedJwtToken();

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({ success: false, error: `${field} already exists.` });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        res.status(500).json({ success: false, error: 'Server Error', details: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra xem email và password có được cung cấp không
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please enter an email and password' });
        }

        // Kiểm tra user tồn tại và lấy password (vì select: false)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // So sánh mật khẩu
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Tạo token
        const token = user.getSignedJwtToken();

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error', details: error.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private (Cần bảo vệ bằng middleware auth)
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id); // req.user.id được thêm vào bởi middleware auth

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error', details: error.message });
    }
};

// @desc    Update user details (chỉ những trường không phải mật khẩu)
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
    try {
        const { username, email } = req.body; // Không cho phép update password trực tiếp từ đây

        const fieldsToUpdate = {
            username,
            email
        };

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({ success: false, error: `${field} already exists.` });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        res.status(500).json({ success: false, error: 'Server Error', details: error.message });
    }
};

// @desc    Update user password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('+password'); // Cần lấy password để so sánh

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, error: 'Please provide current and new password' });
        }

        // Kiểm tra mật khẩu hiện tại
        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Current password is incorrect' });
        }

        // Cập nhật mật khẩu mới (middleware pre('save') sẽ tự động mã hóa)
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        res.status(500).json({ success: false, error: 'Server Error', details: error.message });
    }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private (thực tế không cần, client chỉ cần xóa token)
exports.logout = (req, res) => {
    // Với JWT, việc logout chủ yếu là xóa token ở client.
    // Nếu bạn sử dụng httpOnly cookies, bạn có thể clear cookie ở đây.
    // res.cookie('token', 'none', {
    //     expires: new Date(Date.now() + 10 * 1000), // Hết hạn nhanh chóng
    //     httpOnly: true
    // });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};