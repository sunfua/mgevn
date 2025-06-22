
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
const PORT = 3000;

// Middleware để parse JSON
app.use(express.json());

// Route mẫu
app.get('/', (req, res) => {
    res.send('MGEVN API đang chạy!');
});

// Kết nối MongoDB với Mongoose
(async () => {
    await mongoose.connect(process.env.MONGO_DB_URL)
    .then(() => console.log('Kết nối MongoDB thành công!'))
    .catch((err) => console.error('Lỗi kết nối MongoDB:', err));
    app.listen(PORT, () => {
        console.log(`Server đang lắng nghe tại http://localhost:${PORT}`);
    });
})();