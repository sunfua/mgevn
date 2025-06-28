// backend/routes/studentRoutes.js

const express = require('express');
const {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
} = require('../controllers/studentController'); // Import các hàm từ controller

const router = express.Router();

// Định nghĩa các route
router.route('/').get(getStudents).post(createStudent);
router.route('/:id').get(getStudentById).put(updateStudent).delete(deleteStudent);

module.exports = router;