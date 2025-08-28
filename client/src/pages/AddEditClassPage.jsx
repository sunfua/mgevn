// frontend/src/pages/AddEditClassPage.js

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useParams, useNavigate } from 'react-router-dom';
import classService from '../services/classService';

const AddEditClassPage = () => {
    const { id } = useParams(); // Lấy ID nếu đang ở chế độ chỉnh sửa
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [maxStudents, setMaxStudents] = useState('');
    const [teacher, setTeacher] = useState('');
    const [totalSessions, setTotalSessions] = useState('');
    const [isActive, setIsActive] = useState(true); // Mặc định là active
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const isEditMode = Boolean(id); // Kiểm tra xem có ID -> chế độ chỉnh sửa

    useEffect(() => {
        if (isEditMode) {
            fetchClassDetails();
        }
    }, [id, isEditMode]);

    const fetchClassDetails = async () => {
        setLoading(true);
        try {
            const response = await classService.getClassById(id);
            const classData = response.data;
            setName(classData.name);
            setDescription(classData.description);
            setMaxStudents(classData.maxStudents || '');
            setTeacher(classData.teacher || '');
            setTotalSessions(classData.totalSessions || '');
            setIsActive(classData.isActive);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Không thể tải thông tin lớp học.');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const classData = {
            name,
            description,
            maxStudents: maxStudents ? Number(maxStudents) : undefined,
            teacher,
            totalSessions: totalSessions ? Number(totalSessions) : undefined,
            isActive
        };

        try {
            if (isEditMode) {
                await classService.updateClass(id, classData);
                setSuccess('Cập nhật lớp học thành công!');
            } else {
                await classService.createClass(classData);
                setSuccess('Thêm lớp học thành công!');
                // Reset form sau khi thêm mới
                setName('');
                setDescription('');
                setMaxStudents('');
                setTeacher('');
                setTotalSessions('');
                setIsActive(true);
            }
            setLoading(false);
            // Có thể chuyển hướng về trang danh sách lớp sau một thời gian
            setTimeout(() => {
                navigate('/classes');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Đã xảy ra lỗi.');
            setLoading(false);
        }
    };

    if (loading && isEditMode) {
        return <div className="container card">Đang tải thông tin lớp học...</div>;
    }

    return (
        <div className="container" style={{ maxWidth: '600px', margin: '50px auto' }}>
            <div className="card">
                <h2>{isEditMode ? 'Chỉnh sửa Lớp học' : 'Thêm Lớp học mới'}</h2>
                {success && <div className="alert alert-success">{success}</div>}
                {error && <div className="alert alert-danger">{Array.isArray(error) ? error.join(', ') : error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Tên lớp:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={isEditMode} // Không cho sửa tên lớp khi chỉnh sửa để tránh lỗi unique
                        />
                         {isEditMode && <small><i>(Không thể thay đổi tên lớp khi chỉnh sửa)</i></small>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Mô tả:</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="teacher">Giáo viên phụ trách:</label>
                        <input
                            type="text"
                            id="teacher"
                            value={teacher}
                            onChange={(e) => setTeacher(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="maxStudents">Số học viên tối đa:</label>
                        <input
                            type="number"
                            id="maxStudents"
                            value={maxStudents}
                            onChange={(e) => setMaxStudents(e.target.value)}
                            min="1"
                        />
                    </div>
                     <div className="form-group">
                        <label htmlFor="totalSessions">Tổng số buổi học (khóa):</label>
                        <input
                            type="number"
                            id="totalSessions"
                            value={totalSessions}
                            onChange={(e) => setTotalSessions(e.target.value)}
                            min="0"
                        />
                    </div>
                    <div className="form-group">
                        <label>Trạng thái hoạt động:</label>
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            style={{ marginLeft: '10px', width: 'auto' }}
                        />
                        <label htmlFor="isActive" style={{ display: 'inline', marginLeft: '5px' }}>Đang hoạt động</label>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Đang xử lý...' : (isEditMode ? 'Cập nhật Lớp học' : 'Thêm Lớp học')}
                    </button>
                    <Link to="/classes" className="btn btn-secondary" style={{ width: '100%', marginTop: '10px', textAlign: 'center', display: 'block' }}>
                        Hủy
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default AddEditClassPage;