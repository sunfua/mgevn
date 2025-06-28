// backend/models/Attendance.js

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class', // Tham chiếu tới model Class
        required: true
    },
    date: {
        type: Date,
        required: true,
        // Đảm bảo không có 2 bản ghi điểm danh cho cùng một lớp trong cùng một ngày
        // Điều này có thể được xử lý ở logic nghiệp vụ hoặc dùng unique compound index nếu cần
    },
    sessionNumber: { // Nếu có nhiều buổi trong một ngày, hoặc đánh số buổi học
        type: Number,
        min: 1
    },
    attendees: [ // Mảng các học viên và trạng thái điểm danh của họ trong buổi này
        {
            studentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student', // Tham chiếu tới model Student
                required: true
            },
            status: {
                type: String,
                enum: ['Present', 'Absent', 'Late'], // Có mặt, Vắng mặt, Đi muộn
                default: 'Present'
            },
            note: {
                type: String,
                trim: true
            }
        }
    ],
    recordedBy: { // Người điểm danh
        type: String, // Có thể là ObjectId ref tới User model sau này
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

// Tạo unique compound index để đảm bảo một lớp chỉ có một bản ghi điểm danh cho một ngày cụ thể
// Nếu bạn có nhiều session trong một ngày, bạn có thể thêm sessionNumber vào index
attendanceSchema.index({ classId: 1, date: 1 }, { unique: true });

// Middleware Mongoose để cập nhật `updatedAt` mỗi khi có thay đổi
attendanceSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);