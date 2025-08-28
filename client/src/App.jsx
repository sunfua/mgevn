/* import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
 */

// frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ClassListPage from './pages/ClassListPage';
import AddEditClassPage from './pages/AddEditClassPage';
import StudentListPage from './pages/StudentListPage';
import AddEditStudentPage from './pages/AddEditStudentPage';

// Layout & Components (sẽ tạo sau)
import Navbar from './components/Navbar';

// PrivateRoute Component
const PrivateRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return <div>Loading authentication...</div>; // Hoặc một spinner đẹp hơn
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user && !requiredRole.includes(user.role)) {
        return <div>Bạn không có quyền truy cập trang này.</div>; // Hoặc Navigate tới trang lỗi
    }

    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

function AppContent() {
    const { isAuthenticated } = useAuth();
    return (
        <>
            {isAuthenticated && <Navbar />} {/* Hiển thị Navbar nếu đã đăng nhập */}
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Các Route cần bảo vệ */}
                <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                <Route path="/classes" element={<PrivateRoute><ClassListPage /></PrivateRoute>} />
                <Route path="/classes/add" element={<PrivateRoute requiredRole={['admin', 'manager']}><AddEditClassPage /></PrivateRoute>} />
                <Route path="/classes/edit/:id" element={<PrivateRoute requiredRole={['admin', 'manager']}><AddEditClassPage /></PrivateRoute>} />

                {/* Routes cho Học viên */}
                <Route path="/students" element={<PrivateRoute><StudentListPage /></PrivateRoute>} />
                <Route path="/students/add" element={<PrivateRoute requiredRole={['admin', 'manager']}><AddEditStudentPage /></PrivateRoute>} />
                <Route path="/students/edit/:id" element={<PrivateRoute requiredRole={['admin', 'manager']}><AddEditStudentPage /></PrivateRoute>} />

                {/* Redirect bất kỳ đường dẫn không hợp lệ nào về Dashboard nếu đã đăng nhập, ngược lại về Login */}
                <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
            </Routes>
        </>
    );
}

export default App;