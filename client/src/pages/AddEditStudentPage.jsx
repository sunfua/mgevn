// frontend/src/pages/AddEditStudentPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

import studentService from '../services/studentService';
import classService from '../services/classService'; // Để lấy danh sách lớp

const AddEditStudentPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('Khác');
    const [address, setAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState('Active');
    const [selectedClasses, setSelectedClasses] = useState([]); // Array of { classId, enrollmentDate }
    const [availableClasses, setAvailableClasses] = useState([]); // Danh sách các lớp có sẵn

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const isEditMode = Boolean(id);

    useEffect(() => {
        fetchAvailableClasses();
        if (isEditMode) {
            fetchStudentDetails();
        }
    }, [id, isEditMode]);

    const fetchAvailableClasses = async () => {
        try {
            const response = await classService.getAllClasses();
            setAvailableClasses(response.data); // data.data vì response.data là { success, count, data }
        } catch (err) {
            console.error('Không thể tải danh sách lớp học:', err);
            setError('Không thể tải danh sách lớp học để gán.');
        }
    };

    const fetchStudentDetails = async () => {
        setLoading(true);
        try {
            const response = await studentService.getStudentById(id);
            const studentData = response.data;
            setFullName(studentData.fullName);
            setDateOfBirth(studentData.dateOfBirth ? new Date(studentData.dateOfBirth).toISOString().split('T')[0] : '');
            setGender(studentData.gender || 'Khác');
            setAddress(studentData.address || '');
            setPhoneNumber(studentData.phoneNumber);
            setEmail(studentData.email || '');
            setNotes(studentData.notes || '');
            setStatus(studentData.status || 'Active');
            // Chuyển đổi định dạng lớp học cho state selectedClasses
            if (studentData.classes && studentData.classes.length > 0) {
                setSelectedClasses(
                    studentData.classes
                        .filter(c => c.classId) // Đảm bảo classId tồn tại
                        .map(c => ({
                            classId: c.classId._id, // Lấy ID của lớp đã populate
                            enrollmentDate: c.enrollmentDate ? new Date(c.enrollmentDate).toISOString().split('T')[0] : ''
                        }))
                );
            }
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Không thể tải thông tin học viên.');
            setLoading(false);
        }
    };

    const handleClassChange = (index, field, value) => {
        const newSelectedClasses = [...selectedClasses];
        newSelectedClasses[index] = { ...newSelectedClasses[index], [field]: value };
        setSelectedClasses(newSelectedClasses);
    };

    const addClassField = () => {
        setSelectedClasses([...selectedClasses, { classId: '', enrollmentDate: new Date().toISOString().split('T')[0] }]);
    };

    const removeClassField = (index) => {
        const newSelectedClasses = selectedClasses.filter((_, i) => i !== index);
        setSelectedClasses(newSelectedClasses);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Lọc bỏ các lớp trống hoặc trùng lặp
        const validClasses = selectedClasses
            .filter(cls => cls.classId)
            .reduce((acc, current) => {
                const x = acc.find(item => item.classId === current.classId);
                if (!x) {
                    return acc.concat([current]);
                }
                return acc;
            }, []);

        const studentData = {
            fullName,
            dateOfBirth: dateOfBirth || undefined,
            gender,
            address,
            phoneNumber,
            email,
            notes,
            status,
            classes: validClasses // Gửi mảng lớp học đã lọc
        };

        try {
            if (isEditMode) {
                await studentService.updateStudent(id, studentData);
                setSuccess('Cập nhật học viên thành công!');
            } else {
                await studentService.createStudent(studentData);
                setSuccess('Thêm học viên thành công!');
                // Reset form sau khi thêm mới
                setFullName('');
                setDateOfBirth('');
                setGender('Khác');
                setAddress('');
                setPhoneNumber('');
                setEmail('');
                setNotes('');
                setStatus('Active');
                setSelectedClasses([]);
            }
            setLoading(false);
            setTimeout(() => {
                navigate('/students');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Đã xảy ra lỗi.');
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '700px', margin: '50px auto' }}>
            <div className="card">
                <h2>{isEditMode ? 'Chỉnh sửa Học viên' : 'Thêm Học viên mới'}</h2>
                {success && <div className="alert alert-success">{success}</div>}
                {error && <div className="alert alert-danger">{Array.isArray(error) ? error.join(', ') : error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="fullName">Họ và Tên:</label>
                        <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="dateOfBirth">Ngày sinh:</label>
                        <input type="date" id="dateOfBirth" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="gender">Giới tính:</label>
                        <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="address">Địa chỉ:</label>
                        <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phoneNumber">Số điện thoại:</label>
                        <input type="tel" id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="notes">Ghi chú:</label>
                        <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows="3"></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="status">Trạng thái:</label>
                        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="Active">Đang học</option>
                            <option value="On Hold">Bảo lưu</option>
                            <option value="Completed">Đã hoàn thành</option>
                            <option value="Dropped">Đã nghỉ học</option>
                        </select>
                    </div>

                    {/* Quản lý các lớp học mà học viên tham gia */}
                    <div className="form-group" style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
                        <label>Lớp học đã đăng ký:</label>
                        {selectedClasses.map((cls, index) => (
                            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                                <select
                                    value={cls.classId}
                                    onChange={(e) => handleClassChange(index, 'classId', e.target.value)}
                                    style={{ flexGrow: 1 }}
                                >
                                    <option value="">Chọn lớp học</option>
                                    {availableClasses.map(availableCls => (
                                        <option key={availableCls._id} value={availableCls._id}>
                                            {availableCls.name} ({availableCls.teacher})
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="date"
                                    value={cls.enrollmentDate}
                                    onChange={(e) => handleClassChange(index, 'enrollmentDate', e.target.value)}
                                    style={{ width: '150px' }}
                                />
                                <button type="button" className="btn btn-danger" onClick={() => removeClassField(index)} style={{ padding: '8px 12px' }}>
                                    Xóa
                                </button>
                            </div>
                        ))}
                        <button type="button" className="btn btn-secondary" onClick={addClassField} style={{ marginTop: '10px' }}>
                            Thêm lớp
                        </button>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '20px' }}>
                        {loading ? 'Đang xử lý...' : (isEditMode ? 'Cập nhật Học viên' : 'Thêm Học viên')}
                    </button>
                    <Link to="/students" className="btn btn-secondary" style={{ width: '100%', marginTop: '10px', textAlign: 'center', display: 'block' }}>
                        Hủy
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default AddEditStudentPage;