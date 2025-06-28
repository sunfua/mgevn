// backend/controllers/classController.js

const Class = require('../models/Class'); // Import Class model

// @desc    Get all classes
// @route   GET /api/classes
// @access  Public (có thể thêm xác thực sau)
exports.getClasses = async (req, res) => {
    try {
        const classes = await Class.find();
        res.status(200).json({
            success: true,
            count: classes.length,
            data: classes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error',
            details: error.message
        });
    }
};

// @desc    Get single class by ID
// @route   GET /api/classes/:id
// @access  Public
exports.getClassById = async (req, res) => {
    try {
        const singleClass = await Class.findById(req.params.id);

        if (!singleClass) {
            return res.status(404).json({
                success: false,
                error: 'Class not found'
            });
        }

        res.status(200).json({
            success: true,
            data: singleClass
        });
    } catch (error) {
        // Kiểm tra nếu ID không hợp lệ của MongoDB
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid Class ID'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error',
            details: error.message
        });
    }
};

// @desc    Add new class
// @route   POST /api/classes
// @access  Public
exports.createClass = async (req, res) => {
    try {
        const { name, description, maxStudents, teacher, totalSessions } = req.body;

        // Kiểm tra trường 'name' bắt buộc
        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Class name is required'
            });
        }

        // Tạo lớp học mới
        const newClass = await Class.create({ name, description, maxStudents, teacher, totalSessions });

        res.status(201).json({ // 201 Created
            success: true,
            data: newClass
        });
    } catch (error) {
        // Xử lý lỗi trùng lặp tên lớp (unique: true trong schema)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Class with this name already exists'
            });
        }
        // Xử lý lỗi validation khác
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

// @desc    Update class by ID
// @route   PUT /api/classes/:id
// @access  Public
exports.updateClass = async (req, res) => {
    try {
        const { name, description, maxStudents, teacher, totalSessions, isActive } = req.body;

        const updatedClass = await Class.findByIdAndUpdate(
            req.params.id,
            { name, description, maxStudents, teacher, totalSessions, isActive, updatedAt: Date.now() }, // Cập nhật updatedAt thủ công
            {
                new: true, // Trả về tài liệu đã được cập nhật
                runValidators: true // Chạy lại các validators đã định nghĩa trong schema
            }
        );

        if (!updatedClass) {
            return res.status(404).json({
                success: false,
                error: 'Class not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedClass
        });
    } catch (error) {
        // Kiểm tra nếu ID không hợp lệ của MongoDB
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid Class ID'
            });
        }
        // Xử lý lỗi trùng lặp tên lớp
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Class with this name already exists'
            });
        }
        // Xử lý lỗi validation khác
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

// @desc    Delete class by ID
// @route   DELETE /api/classes/:id
// @access  Public
exports.deleteClass = async (req, res) => {
    try {
        const deletedClass = await Class.findByIdAndDelete(req.params.id);

        if (!deletedClass) {
            return res.status(404).json({
                success: false,
                error: 'Class not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {} // Trả về đối tượng rỗng hoặc thông báo thành công
        });
    } catch (error) {
        // Kiểm tra nếu ID không hợp lệ của MongoDB
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid Class ID'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error',
            details: error.message
        });
    }
};