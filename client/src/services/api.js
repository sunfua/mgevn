// frontend/src/services/api.js

import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để thêm token vào mỗi request nếu có
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user ? localStorage.getItem('token') : null; // Lấy token từ localStorage

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor để xử lý lỗi response (ví dụ: token hết hạn)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Nếu response là lỗi 401 Unauthorized và không phải lỗi login/register
        // Cần xử lý logout người dùng
        if (error.response && error.response.status === 401 && !error.request.responseURL.includes('/auth/login') && !error.request.responseURL.includes('/auth/register')) {
            console.error('Unauthorized, logging out...');
            localStorage.removeItem('user'); // Xóa thông tin user
            window.location.href = '/login'; // Chuyển hướng về trang login
        }
        return Promise.reject(error);
    }
);

export default api;