// backend/routes/classRoutes.js

const express = require('express');
const {
    getClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass
} = require('../controllers/classController'); // Import các hàm từ controller

const router = express.Router();

// Định nghĩa các route
router.route('/').get(getClasses).post(createClass);
router.route('/:id').get(getClassById).put(updateClass).delete(deleteClass);

module.exports = router;