// frontend/src/pages/RegisterPage.js

import React, { useState } from 'react';
import authService from '../services/authService'; // Sử dụng authService trực tiếp
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('teacher'); // Mặc định là teacher, admin có thể chỉnh sửa
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await authService.register(username, email, password, role);
            setMessage('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
            // navigate('/login'); // Có thể chuyển hướng thẳng về login
        } catch (err) {
            setError(err.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '500px', margin: '50px auto' }}>
            <div className="card">
                <h2>Đăng ký tài khoản mới</h2>
                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Tên người dùng:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength="6"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">Vai trò:</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="teacher">Giáo viên</option>
                            <option value="manager">Quản lý</option>
                            <option value="admin">Quản trị viên</option>
                            <option value="accountant">Kế toán</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Đăng ký
                    </button>
                </form>
                <p style={{ marginTop: '20px', textAlign: 'center' }}>
                    Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;