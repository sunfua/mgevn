// backend/routes/paymentRoutes.js

const express = require('express');
const {
    getAllPayments,
    getPaymentById,
    getStudentPayments,
    recordPayment,
    updatePayment,
    deletePayment
} = require('../controllers/paymentController');

const router = express.Router();

// Định nghĩa các route
router.route('/').get(getAllPayments).post(recordPayment);
router.route('/:id').get(getPaymentById).put(updatePayment).delete(deletePayment);
router.route('/student/:studentId').get(getStudentPayments); // Lấy lịch sử thanh toán của một học viên

module.exports = router;