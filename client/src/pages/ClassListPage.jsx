// frontend/src/pages/ClassListPage.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classService from '../services/classService';
import { useAuth } from '../context/AuthContext'; // Để kiểm tra quyền

const ClassListPage = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth(); // Lấy thông tin user để kiểm tra role

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await classService.getAllClasses();
            setClasses(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Không thể tải danh sách lớp học.');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa lớp học này không?')) {
            try {
                await classService.deleteClass(id);
                alert('Lớp học đã được xóa thành công!');
                fetchClasses(); // Tải lại danh sách sau khi xóa
            } catch (err) {
                setError(err.response?.data?.error || 'Không thể xóa lớp học.');
            }
        }
    };

    if (loading) {
        return <div className="container card">Đang tải danh sách lớp học...</div>;
    }

    if (error) {
        return <div className="container card alert alert-danger">{error}</div>;
    }

    // Kiểm tra quyền: Chỉ admin và manager mới được thêm/sửa/xóa
    const canManageClasses = user && (user.role === 'admin' || user.role === 'manager');

    return (
        <div className="container">
            <div className="card">
                <h2>Quản lý Lớp học</h2>
                {canManageClasses && (
                    <Link to="/classes/add" className="btn btn-primary" style={{ marginBottom: '20px' }}>
                        Thêm Lớp học mới
                    </Link>
                )}
                {classes.length === 0 ? (
                    <p>Chưa có lớp học nào.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Tên lớp</th>
                                <th>Mô tả</th>
                                <th>Giáo viên</th>
                                <th>Số HV tối đa</th>
                                <th>Tổng buổi</th>
                                <th>Trạng thái</th>
                                {canManageClasses && <th>Hành động</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {classes.map((cls) => (
                                <tr key={cls._id}>
                                    <td>{cls.name}</td>
                                    <td>{cls.description}</td>
                                    <td>{cls.teacher}</td>
                                    <td>{cls.maxStudents}</td>
                                    <td>{cls.totalSessions}</td>
                                    <td>{cls.isActive ? 'Đang hoạt động' : 'Đã dừng'}</td>
                                    {canManageClasses && (
                                        <td>
                                            <Link to={`/classes/edit/${cls._id}`} className="btn btn-secondary" style={{ marginRight: '10px' }}>
                                                Sửa
                                            </Link>
                                            <button onClick={() => handleDelete(cls._id)} className="btn btn-danger">
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

export default ClassListPage;