import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { ToastProvider } from './components/Toast.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EmployeeList from './pages/EmployeeList.jsx';
import EmployeeForm from './pages/EmployeeForm.jsx';
import EmployeeShow from './pages/EmployeeShow.jsx';
import ServiceRecordForm from './pages/ServiceRecordForm.jsx';
import ServiceRecordDetail from './pages/ServiceRecordDetail.jsx';
import AdminLists from './pages/AdminLists.jsx';
import Search from './pages/Search.jsx';

const App = () => {
    return (
        <ToastProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                    <Route path="employees" element={<EmployeeList />} />
                    <Route path="employees/create" element={<EmployeeForm />} />
                    <Route path="employees/:id/edit" element={<EmployeeForm />} />
                    <Route path="employees/:id" element={<EmployeeShow />} />
                    <Route path="service-records/create" element={<ServiceRecordForm />} />
                    <Route path="service-records/:id/edit" element={<ServiceRecordForm />} />
                    <Route path="service-records/:id" element={<ServiceRecordDetail />} />
                    <Route path="admin-lists" element={<AdminLists />} />
                    <Route path="positions" element={<Navigate to="/admin-lists" replace />} />
                    <Route path="offices" element={<Navigate to="/admin-lists" replace />} />
                    <Route path="employment-status" element={<Navigate to="/admin-lists" replace />} />
                    <Route path="search" element={<Search />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </ToastProvider>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
