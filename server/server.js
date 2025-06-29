
const express = require('express');
const mongoose = require('mongoose');
const classRoutes = require('./routes/classRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendenceRoutes'); 
const paymentRoutes = require('./routes/paymentRoutes'); // Thêm route thanh toán
const authRoutes = require('./routes/authRoutes'); // Thêm route xác thực người dùng
const { protect, authorize } = require('./middleware/auth'); // Import middleware xác thực

require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware để parse JSON
app.use(express.json());

// Route mẫu
app.get('/', (req, res) => {
    res.send('MGEVN API đang chạy!');
});

// Mount routers
// Tất cả các route liên quan đến lớp học sẽ bắt đầu với '/api/classes'
app.use('/api/auth', authRoutes); // Thêm route xác thực người dùng
// // Các route khác sẽ được bảo vệ bằng middleware auth
// app.use('/api', protect); // Bảo vệ tất cả các route sau đây
// app.use('/api', authorize('admin', 'teacher')); // Chỉ cho phép admin và teacher truy cập
// // Các route cho lớp học, học viên, điểm danh và thanh toán
// app.use('/api/classes', classRoutes);
// app.use('/api/students', studentRoutes);
// app.use('/api/attendances', attendanceRoutes);
// app.use('/api/payments', paymentRoutes); // Thêm route thanh toán


// Áp dụng middleware bảo vệ cho các route quản lý dữ liệu chính
// Ví dụ: chỉ cho phép người dùng đã đăng nhập và có vai trò phù hợp mới được truy cập
app.use('/api/classes', protect, classRoutes); // Mọi thao tác trên lớp học đều cần đăng nhập
app.use('/api/students', protect, studentRoutes); // Mọi thao tác trên học viên đều cần đăng nhập
app.use('/api/attendances', protect, attendanceRoutes); // Mọi thao tác điểm danh đều cần đăng nhập
app.use('/api/payments', protect, paymentRoutes); // Mọi thao tác học phí đều cần đăng nhập

// Ví dụ: chỉ admin và manager mới được tạo/cập nhật/xóa lớp học
// Bạn có thể áp dụng authorize trực tiếp lên từng route trong classRoutes nếu muốn kiểm soát chi tiết hơn
// Hoặc tạo một route mới như này:
// app.post('/api/classes', protect, authorize('admin', 'manager'), createClass);


// Kết nối MongoDB với Mongoose
(async () => {
    await mongoose.connect(process.env.MONGO_DB_URL)
    .then(() => console.log('Kết nối MongoDB thành công!'))
    .catch((err) => console.error('Lỗi kết nối MongoDB:', err));
    app.listen(PORT, () => {
        console.log(`Server đang lắng nghe tại http://localhost:${PORT}`);
    });
})();