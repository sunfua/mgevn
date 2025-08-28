// frontend/src/services/classService.js

import api from './api';

const CLASS_URL = '/classes';

const getAllClasses = async () => {
    const response = await api.get(CLASS_URL);
    return response.data;
};

const getClassById = async (id) => {
    const response = await api.get(`${CLASS_URL}/${id}`);
    return response.data;
};

const createClass = async (classData) => {
    const response = await api.post(CLASS_URL, classData);
    return response.data;
};

const updateClass = async (id, classData) => {
    const response = await api.put(`${CLASS_URL}/${id}`, classData);
    return response.data;
};

const deleteClass = async (id) => {
    const response = await api.delete(`${CLASS_URL}/${id}`);
    return response.data;
};

const classService = {
    getAllClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass,
};

export default classService;