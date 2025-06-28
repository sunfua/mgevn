// backend/controllers/attendanceController.js

const Attendance = require('../models/Attendence');
const Student = require('../models/Student');
const Class = require('../models/Class');

// @desc    Get all attendance records
// @route   GET /api/attendances
// @access  Public
exports.getAllAttendances = async (req, res) => {
    try {
        // Populate để lấy thông tin tên lớp và tên học viên
        const attendances = await Attendance.find()
            .populate('classId', 'name')
            .populate('attendees.studentId', 'fullName');

        res.status(200).json({
            success: true,
            count: attendances.length,
            data: attendances
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error',
            details: error.message
        });
    }
};

// @desc    Get attendance record by ID
// @route   GET /api/attendances/:id
// @access  Public
exports.getAttendanceById = async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id)
            .populate('classId', 'name')
            .populate('attendees.studentId', 'fullName');

        if (!attendance) {
            return res.status(404).json({
                success: false,
                error: 'Attendance record not found'
            });
        }

        res.status(200).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid Attendance ID'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error',
            details: error.message
        });
    }
};

// @desc    Get attendance records for a specific class on a specific date
// @route   GET /api/attendances/class/:classId/date/:date
// @access  Public
exports.getAttendanceByClassAndDate = async (req, res) => {
    try {
        const { classId, date } = req.params;

        // Chuyển đổi ngày thành định dạng bắt đầu của ngày để tìm kiếm
        const searchDate = new Date(date);
        searchDate.setHours(0, 0, 0, 0); // Đặt về đầu ngày

        const nextDay = new Date(searchDate);
        nextDay.setDate(searchDate.getDate() + 1); // Ngày tiếp theo

        const attendance = await Attendance.findOne({
            classId: classId,
            date: { $gte: searchDate, $lt: nextDay } // Tìm trong khoảng 24h của ngày đó
        })
        .populate('classId', 'name')
        .populate('attendees.studentId', 'fullName');

        if (!attendance) {
            return res.status(404).json({
                success: false,
                error: 'No attendance record found for this class on this date.'
            });
        }

        res.status(200).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid Class ID or Date format'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error',
            details: error.message
        });
    }
};


// @desc    Record or Update attendance for a class
// @route   POST /api/attendances
// @access  Public
exports.recordAttendance = async (req, res) => {
    try {
        const { classId, date, sessionNumber, attendees } = req.body;

        if (!classId || !date || !attendees || attendees.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Class ID, date, and attendees list are required.'
            });
        }

        // Kiểm tra xem lớp học có tồn tại không
        const classExists = await Class.findById(classId);
        if (!classExists) {
            return res.status(400).json({
                success: false,
                error: 'Class not found.'
            });
        }

        // Kiểm tra xem đã có bản ghi điểm danh cho lớp này vào ngày này chưa
        // Chuyển đổi ngày thành định dạng bắt đầu của ngày để tìm kiếm chính xác
        const recordDate = new Date(date);
        recordDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(recordDate);
        nextDay.setDate(recordDate.getDate() + 1);

        let attendanceRecord = await Attendance.findOne({
            classId: classId,
            date: { $gte: recordDate, $lt: nextDay }
        });

        if (attendanceRecord) {
            // Nếu đã có, cập nhật bản ghi hiện có
            attendanceRecord.attendees = attendees;
            attendanceRecord.sessionNumber = sessionNumber || attendanceRecord.sessionNumber; // Cập nhật sessionNumber nếu có
            await attendanceRecord.save();
            res.status(200).json({ // 200 OK for update
                success: true,
                message: 'Attendance record updated successfully.',
                data: attendanceRecord
            });
        } else {
            // Nếu chưa có, tạo bản ghi mới
            attendanceRecord = await Attendance.create({
                classId,
                date: recordDate, // Lưu ngày đã chuẩn hóa
                sessionNumber,
                attendees
            });
            res.status(201).json({ // 201 Created for new record
                success: true,
                message: 'Attendance record created successfully.',
                data: attendanceRecord
            });
        }

        // Cập nhật tổng số buổi đã học cho từng học viên CÓ MẶT
        for (const attendee of attendees) {
            if (attendee.status === 'Present') {
                await Student.updateAttendedSessions(attendee.studentId, 1);
            }
        }

    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: messages
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error',
            details: error.message
        });
    }
};

// @desc    Delete attendance record by ID
// @route   DELETE /api/attendances/:id
// @access  Public (Cần cẩn thận khi xóa, vì nó ảnh hưởng đến totalAttendedSessions)
exports.deleteAttendance = async (req, res) => {
    try {
        const attendanceRecord = await Attendance.findById(req.params.id);

        if (!attendanceRecord) {
            return res.status(404).json({
                success: false,
                error: 'Attendance record not found'
            });
        }

        // Giảm số buổi đã học cho các học viên CÓ MẶT trước khi xóa bản ghi
        for (const attendee of attendanceRecord.attendees) {
            if (attendee.status === 'Present') {
                await Student.updateAttendedSessions(attendee.studentId, -1); // Giảm đi 1 buổi
            }
        }

        await attendanceRecord.deleteOne(); // Sử dụng deleteOne() thay vì findByIdAndDelete để middleware Pre-save không bị trigger
                                         // Hoặc bạn có thể dùng findByIdAndDelete nếu không có pre-middleware ảnh hưởng

        res.status(200).json({
            success: true,
            data: {},
            message: 'Attendance record deleted successfully.'
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid Attendance ID'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error',
            details: error.message
        });
    }
};