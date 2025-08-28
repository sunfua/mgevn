// frontend/src/pages/StudentListPage.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import studentService from '../services/studentService';
import { useAuth } from '../context/AuthContext'; // Để kiểm tra quyền

const StudentListPage = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await studentService.getAllStudents();
            setStudents(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Không thể tải danh sách học viên.');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa học viên này không?')) {
            try {
                await studentService.deleteStudent(id);
                alert('Học viên đã được xóa thành công!');
                fetchStudents(); // Tải lại danh sách sau khi xóa
            } catch (err) {
                setError(err.response?.data?.error || 'Không thể xóa học viên.');
            }
        }
    };

    if (loading) {
        return <div className="container card">Đang tải danh sách học viên...</div>;
    }

    if (error) {
        return <div className="container card alert alert-danger">{error}</div>;
    }

    // Kiểm tra quyền: Chỉ admin và manager mới được thêm/sửa/xóa học viên
    const canManageStudents = user && (user.role === 'admin' || user.role === 'manager');

    return (
        <div className="container">
            <div className="card">
                <h2>Quản lý Học viên</h2>
                {canManageStudents && (
                    <Link to="/students/add" className="btn btn-primary" style={{ marginBottom: '20px' }}>
                        Thêm Học viên mới
                    </Link>
                )}
                {students.length === 0 ? (
                    <p>Chưa có học viên nào.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Họ và Tên</th>
                                <th>Ngày sinh</th>
                                <th>Giới tính</th>
                                <th>Số điện thoại</th>
                                <th>Email</th>
                                <th>Trạng thái</th>
                                <th>Lớp học</th>
                                <th>Số buổi học</th>
                                <th>Số tiền đã đóng</th>
                                <th>Còn nợ</th>
                                {canManageStudents && <th>Hành động</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student._id}>
                                    <td>{student.fullName}</td>
                                    <td>{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}</td>
                                    <td>{student.gender}</td>
                                    <td>{student.phoneNumber}</td>
                                    <td>{student.email}</td>
                                    <td>{student.status}</td>
                                    <td>
                                        {student.classes && student.classes.length > 0
                                            ? student.classes.map(c => c.classId ? c.classId.name : 'N/A').join(', ')
                                            : 'Chưa có'}
                                    </td>
                                    <td>{student.totalAttendedSessions}</td>
                                    <td>{student.paymentStatus.paidAmount?.toLocaleString('vi-VN')} VND</td>
                                    <td style={{ color: student.paymentStatus.isDebt ? 'red' : 'green' }}>
                                        {student.paymentStatus.outstandingAmount?.toLocaleString('vi-VN')} VND
                                    </td>
                                    {canManageStudents && (
                                        <td>
                                            <Link to={`/students/edit/${student._id}`} className="btn btn-secondary" style={{ marginRight: '10px' }}>
                                                Sửa
                                            </Link>
                                            <button onClick={() => handleDelete(student._id)} className="btn btn-danger">
                                                Xóa
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default StudentListPage;