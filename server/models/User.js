// backend/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Để mã hóa mật khẩu
const jwt = require('jsonwebtoken'); // Để tạo JWT

// Định nghĩa schema cho User
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false // Không trả về mật khẩu khi tìm kiếm user
    },
    role: {
        type: String,
        enum: ['admin', 'manager', 'teacher', 'accountant'], // Các vai trò có thể
        default: 'teacher'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware để mã hóa mật khẩu trước khi lưu
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) { // Chỉ mã hóa nếu mật khẩu đã được thay đổi (hoặc mới tạo)
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Phương thức để so sánh mật khẩu đã nhập với mật khẩu đã mã hóa
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Phương thức để tạo và trả về JWT
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

module.exports = mongoose.model('User', userSchema);