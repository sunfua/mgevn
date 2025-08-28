// frontend/src/services/studentService.js

import api from './api';

const STUDENT_URL = '/students';

const getAllStudents = async () => {
    const response = await api.get(STUDENT_URL);
    return response.data;
};

// Hàm mới để lấy học viên theo lớp (lọc ở frontend)
const getStudentsByClassId = async (classId) => {
    const allStudentsResponse = await getAllStudents();
    const studentsInClass = allStudentsResponse.data.filter(student =>
        student.classes.some(c => c.classId && c.classId._id === classId)
    );
    return studentsInClass;
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
    getStudentsByClassId, // Thêm hàm này
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
};

export default studentService;