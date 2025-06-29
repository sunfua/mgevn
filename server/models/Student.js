// backend/models/Student.js

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true // Loại bỏ khoảng trắng thừa ở đầu và cuối chuỗi
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['Nam', 'Nữ', 'Khác'], // Chỉ cho phép các giá trị này
        default: 'Khác'
    },
    address: {
        type: String,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true, // Số điện thoại phải là duy nhất
        trim: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true, // Cho phép nhiều tài liệu có giá trị email là null hoặc không tồn tại mà không gây lỗi unique
        trim: true,
        lowercase: true, // Chuyển email về chữ thường
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'] // Regex kiểm tra định dạng email
    },
    notes: {
        type: String,
        trim: true
    },
    // Các lớp học mà học viên này đang tham gia
    classes: [
        {
            classId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Class' // Tham chiếu tới model Class
            },
            enrollmentDate: {
                type: Date,
                default: Date.now
            }
        }
    ],
    // Thông tin học phí tổng quan
    paymentStatus: {
        totalAmount: { // Tổng số tiền học phí dự kiến cho gói học/khóa học
            type: Number,
            default: 0
        },
        paidAmount: { // Tổng số tiền đã đóng
            type: Number,
            default: 0
        },
        outstandingAmount: { // Số tiền còn nợ = totalAmount - paidAmount
            type: Number,
            default: 0
        },
        lastPaymentDate: { // Ngày giao dịch gần nhất
            type: Date
        },
        nextPaymentReminderDate: { // Ngày hệ thống cần nhắc nhở về học phí
            type: Date
        },
        isDebt: { // Có đang nợ hay không
            type: Boolean,
            default: false
        }
    },
    totalAttendedSessions: { // Tổng số buổi đã học (dựa trên điểm danh)
        type: Number,
        default: 0
    },
    status: { // Trạng thái của học viên (ví dụ: đang học, bảo lưu, đã hoàn thành)
        type: String,
        enum: ['Active', 'On Hold', 'Completed', 'Dropped'],
        default: 'Active'
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
studentSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Tính toán `outstandingAmount` và `isDebt` trước khi lưu
studentSchema.pre('save', function (next) {
    this.paymentStatus.outstandingAmount = this.paymentStatus.totalAmount - this.paymentStatus.paidAmount;
    this.paymentStatus.isDebt = this.paymentStatus.outstandingAmount > 0;
    next();
});

// backend/models/Student.js (Thêm đoạn này vào cuối file, trước module.exports)

// Static method to update totalAttendedSessions for a student
studentSchema.statics.updateAttendedSessions = async function(studentId, sessionsToAdd) {
    try {
        const student = await this.findById(studentId);
        if (student) {
            student.totalAttendedSessions += sessionsToAdd;
            await student.save();
            return student;
        }
        return null;
    } catch (error) {
        console.error('Error updating attended sessions for student:', studentId, error);
        throw new Error('Could not update attended sessions.');
    }
};

// backend/models/Student.js (Thêm đoạn này vào cuối file, trước module.exports)

// Static method to update payment status for a student after a payment
studentSchema.statics.updatePaymentStatus = async function(studentId, amountPaid) {
    try {
        const student = await this.findById(studentId);
        if (student) {
            student.paymentStatus.paidAmount += amountPaid;
            student.paymentStatus.lastPaymentDate = Date.now();
            // Logic tính toán outstandingAmount và isDebt sẽ tự động chạy nhờ pre('save') middleware
            await student.save();
            return student;
        }
        return null;
    } catch (error) {
        console.error('Error updating payment status for student:', studentId, error);
        throw new Error('Could not update payment status.');
    }
};

// Static method to calculate and set nextPaymentReminderDate based on total sessions and attended sessions
studentSchema.statics.setPaymentReminder = async function(studentId, classTotalSessions) {
    try {
        const student = await this.findById(studentId);
        if (!student) {
            return null;
        }

        // Giả định tổng số buổi của khóa học/lớp là `classTotalSessions`
        // Nếu bạn muốn quản lý học phí theo gói buổi cụ thể của học viên, bạn cần thêm trường đó vào Student Schema
        // Ví dụ: student.enrollmentDetails.packageTotalSessions

        // Tính toán số buổi còn lại
        const sessionsRemaining = classTotalSessions - student.totalAttendedSessions;

        if (sessionsRemaining <= 2 && sessionsRemaining > 0) {
            // Cảnh báo khi còn 1 hoặc 2 buổi
            // Đặt ngày nhắc nhở là ngày hiện tại hoặc ngày cụ thể nào đó
            student.paymentStatus.nextPaymentReminderDate = Date.now();
            console.log(`Cảnh báo học phí cho học viên ${student.fullName}: Chỉ còn ${sessionsRemaining} buổi.`);
        } else {
            // Xóa ngày nhắc nhở nếu không cần thiết
            student.paymentStatus.nextPaymentReminderDate = undefined;
        }
        await student.save();
        return student;
    } catch (error) {
        console.error('Error setting payment reminder for student:', studentId, error);
        throw new Error('Could not set payment reminder.');
    }
};

module.exports = mongoose.model('Student', studentSchema);