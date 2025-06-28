// backend/models/Payment.js

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student', // Tham chiếu tới model Student
        required: true
    },
    amount: { // Số tiền của giao dịch thanh toán này
        type: Number,
        required: true,
        min: 0
    },
    paymentType: { // Loại thanh toán: Trọn gói hay một phần
        type: String,
        enum: ['Full', 'Partial'],
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    method: { // Phương thức thanh toán
        type: String,
        enum: ['Cash', 'Bank Transfer', 'Credit Card', 'Other'],
        default: 'Cash'
    },
    recordedBy: { // Người ghi nhận thanh toán (ví dụ: tên admin/quản lý)
        type: String, // Có thể là ObjectId ref tới User model sau này
        trim: true
    },
    note: {
        type: String,
        trim: true
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
paymentSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Payment', paymentSchema);