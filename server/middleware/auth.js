// backend/middleware/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Bảo vệ các route
exports.protect = async (req, res, next) => {
    let token;

    // Kiểm tra token trong headers (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Có thể kiểm tra trong cookie nếu bạn dùng httpOnly cookie:
    // else if (req.cookies.token) {
    //     token = req.cookies.token;
    // }

    // Đảm bảo token tồn tại
    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    try {
        // Xác minh token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded); // Để kiểm tra payload của token

        req.user = await User.findById(decoded.id); // Gán user vào req object
        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
};

// Cấp quyền dựa trên vai trò (Roles)
exports.authorize = (...roles) => { // roles là một mảng các vai trò được phép
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};