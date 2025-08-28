// frontend/src/services/studentService.js

import api from './api';

const STUDENT_URL = '/students';

const getAllStudents = async () => {
    const response = await api.get(STUDENT_URL);
    return response.data;
};

const getStudentById = async (id) => {
    const response = await api.get(`${STUDENT_URL}/${id}`);
    return response.data;
};

const createStudent = async (studentData) => {
    const response = await api.post(STUDENT_URL, studentData);
    return response.data;
};

const updateStudent = async (id, studentData) => {
    const response = await api.put(`${STUDENT_URL}/${id}`, studentData);
    return response.data;
};

const deleteStudent = async (id) => {
    const response = await api.delete(`${STUDENT_URL}/${id}`);
    return response.data;
};

const studentService = {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
};

export default studentService;