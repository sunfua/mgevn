// frontend/src/services/paymentService.js

import api from './api';

const PAYMENT_URL = '/payments';

const getAllPayments = async () => {
    const response = await api.get(PAYMENT_URL);
    return response.data;
};

const getStudentPayments = async (studentId) => {
    const response = await api.get(`${PAYMENT_URL}/student/${studentId}`);
    return response.data;
};

const recordPayment = async (paymentData) => {
    const response = await api.post(PAYMENT_URL, paymentData);
    return response.data;
};

const deletePayment = async (id) => {
    const response = await api.delete(`${PAYMENT_URL}/${id}`);
    return response.data;
};

const paymentService = {
    getAllPayments,
    getStudentPayments,
    recordPayment,
    deletePayment,
};

export default paymentService;