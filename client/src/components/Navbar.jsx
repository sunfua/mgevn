// frontend/src/components/Navbar.js

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar">
            <Link to="/dashboard" className="navbar-brand">
                Student Management
            </Link>
            <ul className="navbar-nav">
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/classes">Lớp học</Link></li>
                <li><Link to="/students">Học viên</Link></li>
                <li><Link to="/attendances">Điểm danh</Link></li>
                <li><Link to="/payments">Học phí</Link></li>
                {user && <li><span>Xin chào, {user.username} ({user.role})</span></li>}
                <li><button onClick={logout}>Đăng xuất</button></li>
            </ul>
        </nav>
    );
};

export default Navbar;