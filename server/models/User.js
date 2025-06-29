const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema ({
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
        select: false // Không trả về mật khẩu trong các truy vấn
    },
    role: {
        type: String,
        enum: ['admin', 'manager', 'teacher', 'student', 'accountant'],
        default: 'teacher'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
// Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) { // Nếu mật khẩu không thay đổi, không cần mã hóa lại
        return next();
    }
    // Sử dụng bcrypt để mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
// Phương thức để so sánh mật khẩu
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}
// Phương thức để tạo JWT token
userSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
}
// Tạo mô hình User từ schema
const User = mongoose.model('User', userSchema);
