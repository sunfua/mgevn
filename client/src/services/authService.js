// frontend/src/services/authService.js

import api from './api';

const AUTH_URL = '/auth';

const register = async (username, email, password, role) => {
    const response = await api.post(`${AUTH_URL}/register`, { username, email, password, role });
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token); // Lưu token riêng để dễ quản lý
    }
    return response.data;
};

const login = async (email, password) => {
    const response = await api.post(`${AUTH_URL}/login`, { email, password });
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
};

const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

const getToken = () => {
    return localStorage.getItem('token');
};

const authService = {
    register,
    login,
    logout,
    getCurrentUser,
    getToken
};

export default authService;