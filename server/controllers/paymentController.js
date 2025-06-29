// backend/controllers/paymentController.js

const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Class = require('../models/Class'); // Cần để lấy thông tin tổng buổi học

// @desc    Get all payment records
// @route   GET /api/payments
// @access  Public
exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find().populate('studentId', 'fullName phoneNumber email');
        res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error',
            details: error.message
        });
    }
};

// @desc    Get payment record by ID
// @route   GET /api/payments/:id
// @access  Public
exports.getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('studentId', 'fullName phoneNumber email');

        if (!payment) {
            return res.status(404).json({
                success: false,
                error: 'Payment record not found'
            });
        }

        res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid Payment ID'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error',
            details: error.message
        });
    }
};

// @desc    Get payment history for a specific student
// @route   GET /api/payments/student/:studentId
// @access  Public
exports.getStudentPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ studentId: req.params.studentId }).sort({ paymentDate: -1 });
        if (payments.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No payment records found for this student.'
            });
        }
        res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
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

// @desc    Record new payment
// @route   POST /api/payments
// @access  Public
exports.recordPayment = async (req, res) => {
    try {
        const { studentId, amount, paymentType, method, recordedBy, note } = req.body;

        if (!studentId || !amount || !paymentType) {
            return res.status(400).json({
                success: false,
                error: 'Student ID, amount, and payment type are required.'
            });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found.'
            });
        }

        // Tạo bản ghi thanh toán mới
        const newPayment = await Payment.create({
            studentId,
            amount,
            paymentType,
            method,
            recordedBy,
            note
        });

        // Cập nhật trạng thái học phí của học viên
        await Student.updatePaymentStatus(studentId, amount);

        // Sau khi cập nhật học phí, có thể kiểm tra để đặt cảnh báo nếu cần
        // Giả định học viên chỉ tham gia 1 lớp, hoặc lấy tổng số buổi của gói học mà học viên đã đăng ký
        if (student.classes && student.classes.length > 0) {
            const mainClassId = student.classes[0].classId; // Lấy lớp đầu tiên làm ví dụ
            const mainClass = await Class.findById(mainClassId);
            if (mainClass && mainClass.totalSessions) {
                await Student.setPaymentReminder(studentId, mainClass.totalSessions);
            }
        }


        res.status(201).json({
            success: true,
            message: 'Payment recorded and student payment status updated.',
            data: newPayment
        });

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

// @desc    Update payment record
// @route   PUT /api/payments/:id
// @access  Public (Cần cẩn thận khi update, nên cân nhắc chỉ cho phép xóa và tạo lại)
exports.updatePayment = async (req, res) => {
    try {
        const { amount, paymentType, method, recordedBy, note } = req.body;

        const oldPayment = await Payment.findById(req.params.id);
        if (!oldPayment) {
            return res.status(404).json({
                success: false,
                error: 'Payment record not found'
            });
        }

        // Tính toán sự thay đổi trong số tiền
        const amountDifference = amount - oldPayment.amount;

        const updatedPayment = await Payment.findByIdAndUpdate(
            req.params.id,
            { amount, paymentType, method, recordedBy, note, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        // Cập nhật lại paymentStatus của học viên nếu số tiền thay đổi
        if (amountDifference !== 0) {
            // Trừ đi số tiền cũ, cộng thêm số tiền mới vào paymentStatus của học viên
            const student = await Student.findById(updatedPayment.studentId);
            if (student) {
                student.paymentStatus.paidAmount -= oldPayment.amount; // Giảm số tiền cũ
                student.paymentStatus.paidAmount += amount;            // Thêm số tiền mới
                student.paymentStatus.lastPaymentDate = Date.now();
                await student.save();
            }
        }

        res.status(200).json({
            success: true,
            data: updatedPayment
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid Payment ID'
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


// @desc    Delete payment record
// @route   DELETE /api/payments/:id
// @access  Public (Cần cẩn thận khi xóa, vì nó ảnh hưởng đến totalAttendedSessions)
exports.deletePayment = async (req, res) => {
    try {
        const paymentRecord = await Payment.findById(req.params.id);

        if (!paymentRecord) {
            return res.status(404).json({
                success: false,
                error: 'Payment record not found'
            });
        }

        // Hoàn lại số tiền đã đóng khỏi trạng thái học phí của học viên
        const student = await Student.findById(paymentRecord.studentId);
        if (student) {
            student.paymentStatus.paidAmount -= paymentRecord.amount;
            student.paymentStatus.lastPaymentDate = Date.now(); // Cập nhật lại ngày thanh toán gần nhất
            await student.save();
        }

        await paymentRecord.deleteOne(); // Xóa bản ghi thanh toán

        res.status(200).json({
            success: true,
            data: {},
            message: 'Payment record deleted and student payment status reverted.'
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid Payment ID'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error',
            details: error.message
        });
    }
};