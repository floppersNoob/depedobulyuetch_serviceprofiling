import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../components/Toast.jsx';
import DonutChart from '../components/DonutChart.jsx';

const Dashboard = () => {
    const [stats, setStats] = useState({
        employees: 0,
        serviceRecords: 0,
        positions: 0,
        offices: 0
    });
    const [recentEmployees, setRecentEmployees] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        surname: '',
        given_name: '',
        middle_name: '',
        birth_date: '',
        birth_place: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [empRes, posRes, offRes, actRes] = await Promise.all([
                axios.get('/api/employees'),
                axios.get('/api/positions'),
                axios.get('/api/offices'),
                axios.get('/api/activity-logs')
            ]);

            const employees = empRes.data.data || [];
            const totalServiceRecords = employees.reduce((acc, emp) => acc + (emp.service_records_count || 0), 0);

            setStats({
                employees: empRes.data.total || employees.length,
                serviceRecords: totalServiceRecords,
                positions: posRes.data.length || 0,
                offices: offRes.data.length || 0
            });

            setRecentEmployees(employees.slice(0, 5));
            setActivities(actRes.data || []);
        } catch (error) {
            addToast('Failed to load dashboard data', 'error');
        }
        setLoading(false);
    };

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    };

    const openModal = () => {
        setFormData({
            surname: '',
            given_name: '',
            middle_name: '',
            birth_date: '',
            birth_place: ''
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormErrors({});
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setFormErrors({ ...formErrors, [e.target.name]: null });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});
        setFormLoading(true);

        try {
            await axios.post('/api/employees', formData);
            addToast('Employee created successfully', 'success');
            closeModal();
            fetchStats();
        } catch (error) {
            if (error.response?.data?.errors) {
                setFormErrors(error.response.data.errors);
            } else {
                addToast('Failed to create employee', 'error');
            }
        }
        setFormLoading(false);
    };

    const statCards = [
        { title: 'Total Employees', value: stats.employees, icon: 'fas fa-users', color: 'bg-blue-500', link: '/employees' },
        { title: 'Service Records', value: stats.serviceRecords, icon: 'fas fa-clipboard-list', color: 'bg-green-500', link: '/employees' },
        { title: 'Designations', value: stats.positions, icon: 'fas fa-briefcase', color: 'bg-purple-500', link: '/positions' },
        { title: 'Offices', value: stats.offices, icon: 'fas fa-building', color: 'bg-orange-500', link: '/offices' }
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="glass-card text-dpwh-blue rounded-2xl p-4 flex justify-between items-center -mt-4">
                <div>
                    <h1 className="text-xl font-bold">Welcome to DPWH Service Record System</h1>
                    <p className="text-gray-600 text-sm">Manage employee service records efficiently and generate reports instantly.</p>
                </div>
                <button
                    onClick={openModal}
                    className="bg-[#eb3505] text-white px-4 py-2 rounded-lg hover:bg-[#c92d04] transition-colors font-medium"
                >
                    + Add Employee
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <Link
                        key={index}
                        to={stat.link}
                        className="glass-card rounded-2xl shadow hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 group"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                                <p className="text-3xl font-bold text-dpwh-blue">{stat.value}</p>
                            </div>
                            <div className={`${stat.color} text-white rounded-full w-12 h-12 flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
                                <i className={stat.icon}></i>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* 3-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Donut Chart (40%) */}
                <div className="lg:col-span-1 glass-card rounded-2xl shadow p-6">
                    <h2 className="text-lg font-bold text-dpwh-blue mb-4">Service Record Distribution</h2>
                    <DonutChart
                        data={[
                            { value: stats.serviceRecords, color: '#3B82F6' },
                            { value: Math.max(0, stats.employees - stats.serviceRecords), color: '#93C5FD' }
                        ]}
                        size={200}
                    />
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center">
                                <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                                With Records
                            </span>
                            <span className="font-semibold">{stats.serviceRecords}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center">
                                <span className="w-3 h-3 rounded-full bg-blue-300 mr-2"></span>
                                Without Records
                            </span>
                            <span className="font-semibold">{Math.max(0, stats.employees - stats.serviceRecords)}</span>
                        </div>
                    </div>
                </div>

                {/* Middle Column - Recent Employees (35%) */}
                <div className="lg:col-span-1 glass-card rounded-2xl shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-dpwh-blue">Recent Employees</h2>
                        <Link to="/employees" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                            View All
                        </Link>
                    </div>
                    {recentEmployees.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No employees yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentEmployees.map(emp => (
                                <Link
                                    key={emp.employee_id}
                                    to={`/employees/${emp.employee_id}`}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/50 transition-colors group"
                                >
                                    <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-semibold flex-shrink-0">
                                        {emp.surname.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-dpwh-blue truncate">{emp.surname}, {emp.given_name}</p>
                                        <p className="text-xs text-gray-500">{emp.service_records_count || 0} records</p>
                                    </div>
                                    <i className="fas fa-chevron-right text-gray-400 group-hover:text-gray-600 transition-colors"></i>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column - Activity Feed (25%) */}
                <div className="lg:col-span-1 glass-card rounded-2xl shadow p-6">
                    <h2 className="text-lg font-bold text-dpwh-blue mb-4">System Activity</h2>
                    <div className="space-y-4">
                        {activities.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                No recent activity
                            </div>
                        ) : (
                            activities.map((activity) => {
                                const iconColor = activity.action === 'created' ? 'bg-blue-100 text-blue-600' :
                                                   activity.action === 'updated' ? 'bg-purple-100 text-purple-600' :
                                                   activity.action === 'deleted' ? 'bg-red-100 text-red-600' :
                                                   'bg-green-100 text-green-600';
                                const icon = activity.action === 'created' ? 'fa-plus' :
                                             activity.action === 'updated' ? 'fa-edit' :
                                             activity.action === 'deleted' ? 'fa-trash' :
                                             'fa-file-alt';
                                const timeAgo = getTimeAgo(activity.created_at);

                                return (
                                    <div key={activity.id} className="flex items-start gap-3">
                                        <div className={`${iconColor} rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0`}>
                                            <i className={`fas ${icon} text-xs`}></i>
                                        </div>
                                        <div>
                                            <p className="text-sm text-dpwh-blue">{activity.description}</p>
                                            <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Add Employee Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
                    <div
                        className="absolute inset-0 bg-gray-900/30 backdrop-blur-md transition-opacity duration-300"
                        onClick={closeModal}
                    ></div>

                    <div className="relative glass-card rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] max-w-2xl w-full z-10 max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200/50">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl w-10 h-10 flex items-center justify-center shadow-lg">
                                    <i className="fas fa-user-plus"></i>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Add New Employee</h2>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-700">Surname *</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="surname"
                                            value={formData.surname}
                                            onChange={handleFormChange}
                                            required
                                            placeholder="Enter surname"
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 bg-white/50 hover:bg-white"
                                        />
                                        {formErrors.surname && <p className="text-red-500 text-sm mt-1">{formErrors.surname[0]}</p>}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-700">Given Name *</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="given_name"
                                            value={formData.given_name}
                                            onChange={handleFormChange}
                                            required
                                            placeholder="Enter given name"
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 bg-white/50 hover:bg-white"
                                        />
                                        {formErrors.given_name && <p className="text-red-500 text-sm mt-1">{formErrors.given_name[0]}</p>}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-700">Middle Name</label>
                                    <input
                                        type="text"
                                        name="middle_name"
                                        value={formData.middle_name}
                                        onChange={handleFormChange}
                                        placeholder="Enter middle name"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 bg-white/50 hover:bg-white"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-700">Birth Date</label>
                                    <input
                                        type="date"
                                        name="birth_date"
                                        value={formData.birth_date}
                                        onChange={handleFormChange}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 bg-white/50 hover:bg-white"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-700">Birth Place</label>
                                    <input
                                        type="text"
                                        name="birth_place"
                                        value={formData.birth_place}
                                        onChange={handleFormChange}
                                        placeholder="Enter birth place"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 bg-white/50 hover:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200/50">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-6 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                                >
                                    {formLoading ? (
                                        <span className="flex items-center gap-2">
                                            <i className="fas fa-spinner fa-spin"></i>
                                            Saving...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <i className="fas fa-save"></i>
                                            Save Employee
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
