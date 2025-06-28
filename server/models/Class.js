// backend/models/Class.js

const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // Tên lớp phải là duy nhất
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    maxStudents: {
        type: Number,
        min: 1 // Số học viên tối đa phải lớn hơn 0
    },
    teacher: {
        type: String, // Tạm thời dùng String, có thể tham chiếu User nếu có quản lý giáo viên riêng
        trim: true
    },
    // Số buổi học dự kiến cho lớp này (để tính toán nhắc phí)
    totalSessions: {
        type: Number,
        default: 0
    },
    isActive: { // Lớp có đang hoạt động hay không
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware Mongoose để cập nhật `updatedAt` mỗi khi có thay đổi
classSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Class', classSchema);