
const express = require('express');
const mongoose = require('mongoose');
const classRoutes = require('./routes/classRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendenceRoutes'); 

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
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendances', attendanceRoutes);

// Kết nối MongoDB với Mongoose
(async () => {
    await mongoose.connect(process.env.MONGO_DB_URL)
    .then(() => console.log('Kết nối MongoDB thành công!'))
    .catch((err) => console.error('Lỗi kết nối MongoDB:', err));
    app.listen(PORT, () => {
        console.log(`Server đang lắng nghe tại http://localhost:${PORT}`);
    });
})();