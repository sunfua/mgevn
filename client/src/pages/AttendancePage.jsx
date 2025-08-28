// frontend/src/pages/AttendancePage.js

import React, { useState, useEffect } from 'react';
import classService from '../services/classService';
import studentService from '../services/studentService';
import attendanceService from '../services/attendanceService';
import { format } from 'date-fns';

const AttendancePage = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [students, setStudents] = useState([]);
    const [attendanceStatus, setAttendanceStatus] = useState({}); // Dùng object để lưu trạng thái
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await classService.getAllClasses();
            setClasses(response.data);
            setLoading(false);
        } catch (err) {
            setError('Không thể tải danh sách lớp học.');
            setLoading(false);
        }
    };

    const fetchStudentsAndAttendance = async () => {
        if (!selectedClass || !selectedDate) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Lấy danh sách học viên của lớp đã chọn
            const studentsInClass = await studentService.getStudentsByClassId(selectedClass);
            setStudents(studentsInClass);

            // Kiểm tra xem đã có bản ghi điểm danh cho ngày này chưa
            try {
                const attendanceRecord = await attendanceService.getAttendanceByClassAndDate(selectedClass, selectedDate);
                const statusMap = {};
                attendanceRecord.data.attendees.forEach(attendee => {
                    statusMap[attendee.studentId._id] = attendee.status;
                });
                setAttendanceStatus(statusMap);
                setSuccess('Đã tải bản ghi điểm danh hiện có.');
            } catch (err) {
                // Nếu không có bản ghi, tạo trạng thái mặc định là 'Present' cho tất cả
                const initialStatus = {};
                studentsInClass.forEach(student => {
                    initialStatus[student._id] = 'Present';
                });
                setAttendanceStatus(initialStatus);
                console.log('Chưa có bản ghi điểm danh cho ngày này, tạo mới.');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Không thể tải danh sách học viên hoặc điểm danh.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentsAndAttendance();
    }, [selectedClass, selectedDate]);

    const handleStatusChange = (studentId, status) => {
        setAttendanceStatus(prevStatus => ({
            ...prevStatus,
            [studentId]: status
        }));
    };

    const handleSaveAttendance = async () => {
        if (!selectedClass || !selectedDate) {
            setError('Vui lòng chọn lớp học và ngày.');
            return;
        }

        setSubmitLoading(true);
        setError('');
        setSuccess('');

        const attendees = students.map(student => ({
            studentId: student._id,
            status: attendanceStatus[student._id] || 'Absent', // Mặc định là 'Absent' nếu không có trạng thái
        }));

        const attendanceData = {
            classId: selectedClass,
            date: new Date(selectedDate).toISOString(), // Chuyển sang ISO string
            attendees
        };

        try {
            await attendanceService.recordAttendance(attendanceData);
            setSuccess('Điểm danh đã được lưu thành công!');
        } catch (err) {
            setError(err.response?.data?.error || 'Lỗi khi lưu điểm danh.');
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading && classes.length === 0) {
        return <div className="container card">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="container">
            <div className="card">
                <h2>Điểm danh</h2>
                {success && <div className="alert alert-success">{success}</div>}
                {error && <div className="alert alert-danger">{error}</div>}

                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center' }}>
                    <div className="form-group" style={{ flexGrow: 1 }}>
                        <label htmlFor="class-select">Chọn Lớp học:</label>
                        <select
                            id="class-select"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="">-- Chọn lớp --</option>
                            {classes.map(cls => (
                                <option key={cls._id} value={cls._id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ flexGrow: 1 }}>
                        <label htmlFor="date-select">Chọn Ngày:</label>
                        <input
                            type="date"
                            id="date-select"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>

                {loading && selectedClass && <p>Đang tải danh sách học viên...</p>}

                {selectedClass && !loading && students.length === 0 && (
                    <p>Lớp học này chưa có học viên nào.</p>
                )}

                {students.length > 0 && (
                    <>
                        <table>
                            <thead>
                                <tr>
                                    <th>Họ và Tên</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student._id}>
                                        <td>{student.fullName}</td>
                                        <td>
                                            <label style={{ marginRight: '15px' }}>
                                                <input
                                                    type="radio"
                                                    name={`status-${student._id}`}
                                                    value="Present"
                                                    checked={attendanceStatus[student._id] === 'Present'}
                                                    onChange={() => handleStatusChange(student._id, 'Present')}
                                                /> Có mặt
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name={`status-${student._id}`}
                                                    value="Absent"
                                                    checked={attendanceStatus[student._id] === 'Absent'}
                                                    onChange={() => handleStatusChange(student._id, 'Absent')}
                                                /> Vắng mặt
                                            </label>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button
                            className="btn btn-success"
                            onClick={handleSaveAttendance}
                            disabled={submitLoading}
                            style={{ width: '100%', marginTop: '20px' }}
                        >
                            {submitLoading ? 'Đang lưu...' : 'Lưu Điểm danh'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default AttendancePage;