import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from './components/PublicLayout.jsx';
import PublicEmployeeList from './pages/PublicEmployeeList.jsx';
import PublicEmployeeView from './pages/PublicEmployeeView.jsx';

const PublicApp = () => {
    return (
        <BrowserRouter basename="/public">
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<PublicEmployeeList />} />
                    <Route path="/employee/:id" element={<PublicEmployeeView />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

const root = ReactDOM.createRoot(document.getElementById('public-root'));
root.render(<PublicApp />);
