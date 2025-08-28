// frontend/src/pages/DashboardPage.js

import React from 'react';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
    const { user } = useAuth(); // Lấy thông tin người dùng từ AuthContext

    return (
        <div className="container">
            <div className="card">
                <h2>Dashboard</h2>
                {user ? (
                    <div>
                        <p>Chào mừng, **{user.username}**!</p>
                        <p>Vai trò của bạn: **{user.role}**</p>
                        <p>Email: **{user.email}**</p>
                        <p>Tại đây, bạn có thể xem tổng quan về hệ thống và các thông báo quan trọng.</p>
                        <p>Bạn có thể điều hướng đến các chức năng khác từ thanh điều hướng (Navbar).</p>
                    </div>
                ) : (
                    <p>Đang tải thông tin người dùng...</p>
                )}
            </div>

            <div className="card">
                <h3>Các chức năng chính:</h3>
                <ul>
                    <li>**Quản lý Lớp học:** Thêm, sửa, xóa, xem danh sách các lớp học (Piano, Guitar...).</li>
                    <li>**Quản lý Học viên:** Cập nhật thông tin học viên và gán vào lớp học.</li>
                    <li>**Điểm danh:** Ghi nhận sự có mặt của học viên theo buổi học, tự động tính số buổi đã học.</li>
                    <li>**Quản lý Học phí:** Ghi nhận thanh toán, theo dõi công nợ, lịch sử thanh toán và cảnh báo khi học phí sắp hết buổi.</li>
                </ul>
            </div>
        </div>
    );
};

export default DashboardPage;