// backend/controllers/studentController.js

const Student = require('../models/Student'); // Import Student model
const Class = require('../models/Class');     // Cần import Class để kiểm tra và gán lớp

// @desc    Get all students
// @route   GET /api/students
// @access  Public
exports.getStudents = async (req, res) => {
    try {
        // Sử dụng populate để lấy thông tin chi tiết của lớp học mà học viên tham gia
        const students = await Student.find().populate('classes.classId', 'name description');
        res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error',
            details: error.message
        });
    }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Public
exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('classes.classId', 'name description');

        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            data: student
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid Student ID'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error',
            details: error.message
        });
    }
};

// @desc    Add new student
// @route   POST /api/students
// @access  Public
exports.createStudent = async (req, res) => {
    try {
        const { fullName, dateOfBirth, gender, address, phoneNumber, email, notes, classes } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!fullName || !phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Full name and phone number are required'
            });
        }

        // Kiểm tra xem các classId có tồn tại không nếu có truyền vào
        let classObjects = [];
        if (classes && classes.length > 0) {
            for (let i = 0; i < classes.length; i++) {
                const classExists = await Class.findById(classes[i].classId);
                if (!classExists) {
                    return res.status(400).json({
                        success: false,
                        error: `Class with ID ${classes[i].classId} not found.`
                    });
                }
                classObjects.push({ classId: classes[i].classId });
            }
        }

        const newStudent = await Student.create({
            fullName,
            dateOfBirth,
            gender,
            address,
            phoneNumber,
            email,
            notes,
            classes: classObjects // Gán mảng các lớp đã xác thực
        });

        res.status(201).json({
            success: true,
            data: newStudent
        });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                success: false,
                error: `A student with this ${field} already exists.`
            });
        }
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

// @desc    Update student by ID
// @route   PUT /api/students/:id
// @access  Public
exports.updateStudent = async (req, res) => {
    try {
        const { fullName, dateOfBirth, gender, address, phoneNumber, email, notes, classes, paymentStatus, totalAttendedSessions, status } = req.body;

        // Nếu có cập nhật lớp học, cần kiểm tra classId
        let classObjects = [];
        if (classes && classes.length > 0) {
            for (let i = 0; i < classes.length; i++) {
                const classExists = await Class.findById(classes[i].classId);
                if (!classExists) {
                    return res.status(400).json({
                        success: false,
                        error: `Class with ID ${classes[i].classId} not found.`
                    });
                }
                classObjects.push({ classId: classes[i].classId, enrollmentDate: classes[i].enrollmentDate || Date.now() });
            }
        }

        const updateData = {
            fullName,
            dateOfBirth,
            gender,
            address,
            phoneNumber,
            email,
            notes,
            classes: classObjects, // Cập nhật mảng lớp học
            paymentStatus, // Cần cẩn trọng khi update paymentStatus trực tiếp từ đây
            totalAttendedSessions,
            status,
            updatedAt: Date.now()
        };

        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true, // Trả về tài liệu đã được cập nhật
                runValidators: true // Chạy lại các validators đã định nghĩa trong schema
            }
        ).populate('classes.classId', 'name description');

        if (!updatedStudent) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedStudent
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid Student ID'
            });
        }
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                success: false,
                error: `A student with this ${field} already exists.`
            });
        }
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

// @desc    Delete student by ID
// @route   DELETE /api/students/:id
// @access  Public
exports.deleteStudent = async (req, res) => {
    try {
        const deletedStudent = await Student.findByIdAndDelete(req.params.id);

        if (!deletedStudent) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {} // Trả về đối tượng rỗng hoặc thông báo thành công
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid Student ID'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error',
            details: error.message
        });
    }
};