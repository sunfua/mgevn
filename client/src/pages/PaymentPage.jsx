// frontend/src/pages/PaymentPage.js

import React, { useState, useEffect } from 'react';
import studentService from '../services/studentService';
import paymentService from '../services/paymentService';
import { useAuth } from '../context/AuthContext';

const PaymentPage = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // State cho form thanh toán
    const [amount, setAmount] = useState('');
    const [paymentType, setPaymentType] = useState('Full');
    const [method, setMethod] = useState('Cash');
    const [note, setNote] = useState('');

    const { user } = useAuth();
    const canRecordPayment = user && (user.role === 'admin' || user.role === 'accountant');

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

    const handleOpenPaymentForm = (student) => {
        setSelectedStudent(student);
        setShowPaymentForm(true);
    };

    const handleClosePaymentForm = () => {
        setShowPaymentForm(false);
        setSelectedStudent(null);
        // Reset form
        setAmount('');
        setPaymentType('Full');
        setMethod('Cash');
        setNote('');
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedStudent || !amount || amount <= 0) {
            setError('Vui lòng nhập số tiền hợp lệ.');
            return;
        }

        const paymentData = {
            studentId: selectedStudent._id,
            amount: Number(amount),
            paymentType,
            method,
            recordedBy: user.username, // Lấy tên người dùng đang đăng nhập
            note
        };

        try {
            await paymentService.recordPayment(paymentData);
            setSuccess(`Đã ghi nhận thanh toán ${Number(amount).toLocaleString('vi-VN')} VND cho học viên ${selectedStudent.fullName}.`);
            handleClosePaymentForm();
            fetchStudents(); // Cập nhật lại danh sách học viên
        } catch (err) {
            setError(err.response?.data?.error || 'Lỗi khi ghi nhận thanh toán.');
        }
    };

    const getPaymentStatusText = (student) => {
        if (student.paymentStatus.isDebt) {
            return <span style={{ color: 'red', fontWeight: 'bold' }}>Nợ: {student.paymentStatus.outstandingAmount?.toLocaleString('vi-VN')} VND</span>;
        }
        return <span style={{ color: 'green', fontWeight: 'bold' }}>Đã đủ</span>;
    };
    
    // Tạm thời, nếu bạn muốn hiển thị lịch sử thanh toán chi tiết, bạn có thể tạo một component riêng
    const renderPaymentHistory = (student) => {
        // Đây là ví dụ đơn giản, trong thực tế bạn sẽ navigate đến một trang khác
        // Hoặc mở một modal để hiển thị lịch sử
        alert(`Lịch sử thanh toán của học viên ${student.fullName}: \n(Tính năng đang được phát triển)`);
    };

    if (loading) {
        return <div className="container card">Đang tải danh sách học viên...</div>;
    }

    if (error && !showPaymentForm) {
        return <div className="container card alert alert-danger">{error}</div>;
    }

    return (
        <div className="container">
            <div className="card">
                <h2>Quản lý Học phí</h2>
                {success && <div className="alert alert-success">{success}</div>}
                
                {showPaymentForm ? (
                    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }}>
                        <h4>Ghi nhận thanh toán cho: **{selectedStudent.fullName}**</h4>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <form onSubmit={handleRecordPayment}>
                            <div className="form-group">
                                <label htmlFor="amount">Số tiền:</label>
                                <input
                                    type="number"
                                    id="amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="paymentType">Loại thanh toán:</label>
                                <select id="paymentType" value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
                                    <option value="Full">Toàn phần</option>
                                    <option value="Partial">Một phần</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="method">Phương thức:</label>
                                <select id="method" value={method} onChange={(e) => setMethod(e.target.value)}>
                                    <option value="Cash">Tiền mặt</option>
                                    <option value="Bank Transfer">Chuyển khoản</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="note">Ghi chú:</label>
                                <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows="2"></textarea>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn btn-primary">Ghi nhận</button>
                                <button type="button" className="btn btn-secondary" onClick={handleClosePaymentForm}>Hủy</button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <p style={{marginBottom: '20px'}}>Chọn một học viên để ghi nhận thanh toán hoặc xem chi tiết.</p>
                )}
                
                {students.length === 0 ? (
                    <p>Chưa có học viên nào.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Họ và Tên</th>
                                <th>Tổng học phí</th>
                                <th>Đã đóng</th>
                                <th>Trạng thái học phí</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student._id}>
                                    <td>{student.fullName}</td>
                                    <td>{student.paymentStatus.totalAmount?.toLocaleString('vi-VN')} VND</td>
                                    <td>{student.paymentStatus.paidAmount?.toLocaleString('vi-VN')} VND</td>
                                    <td>{getPaymentStatusText(student)}</td>
                                    <td>
                                        {canRecordPayment && (
                                            <button 
                                                className="btn btn-success" 
                                                onClick={() => handleOpenPaymentForm(student)}
                                                style={{marginRight: '10px'}}
                                            >
                                                Thanh toán
                                            </button>
                                        )}
                                        <button 
                                            className="btn btn-secondary"
                                            onClick={() => renderPaymentHistory(student)}
                                        >
                                            Lịch sử
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default PaymentPage;