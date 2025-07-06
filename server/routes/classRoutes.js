// backend/routes/classRoutes.js

const express = require('express');
const {
    getClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass
} = require('../controllers/classController'); // Import các hàm từ controller
const { protect, authorize } = require('../middleware/auth'); // Import middleware xác thực

const router = express.Router();

// Định nghĩa các route
router.route('/').get(getClasses)
      .post(protect, authorize("admin","manager"), createClass);
router.route('/:id').get(getClassById)
      .put(authorize("admin","manager"), updateClass)
      .delete(authorize("admin","manager"), deleteClass);

module.exports = router;