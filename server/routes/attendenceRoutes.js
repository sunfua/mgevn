// backend/routes/attendanceRoutes.js

const express = require('express');
const {
    getAllAttendances,
    getAttendanceById,
    getAttendanceByClassAndDate,
    recordAttendance,
    deleteAttendance
} = require('../controllers/attendanceController');

const router = express.Router();

// Định nghĩa các route
router.route('/').get(getAllAttendances).post(recordAttendance);
router.route('/:id').get(getAttendanceById).delete(deleteAttendance);
router.route('/class/:classId/date/:date').get(getAttendanceByClassAndDate); // Route để lấy điểm danh theo lớp và ngày

module.exports = router;