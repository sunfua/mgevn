// frontend/src/services/attendanceService.js

import api from './api';

const ATTENDANCE_URL = '/attendances';

const getAttendanceByClassAndDate = async (classId, date) => {
    // API backend đang mong đợi ngày ở định dạng YYYY-MM-DD
    const response = await api.get(`${ATTENDANCE_URL}/class/${classId}/date/${date}`);
    return response.data;
};

const recordAttendance = async (attendanceData) => {
    const response = await api.post(ATTENDANCE_URL, attendanceData);
    return response.data;
};

const attendanceService = {
    getAttendanceByClassAndDate,
    recordAttendance,
};

export default attendanceService;