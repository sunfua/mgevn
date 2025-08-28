// frontend/src/context/AuthContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Thông tin user đã đăng nhập
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Trạng thái xác thực
    const [loading, setLoading] = useState(true); // Trạng thái tải (để kiểm tra token khi khởi động app)
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = authService.getCurrentUser();
        const storedToken = authService.getToken();
        console.log('Stored User:', storedUser);
        if (storedUser && storedToken) {
            // Có thể gọi API /auth/me ở đây để xác thực token là còn hiệu lực
            // Tuy nhiên, với interceptor của Axios đã xử lý 401, tạm thời có thể bỏ qua
            setUser(storedUser);
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const data = await authService.login(email, password);
            setUser(data.user);
            setIsAuthenticated(true);
            return data;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
        navigate('/login'); // Chuyển hướng về trang login sau khi logout
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);