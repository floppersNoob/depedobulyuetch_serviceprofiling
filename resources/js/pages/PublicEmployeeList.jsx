import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PublicEmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchEmployees();
    }, [currentPage]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/public/employees', {
                params: {
                    page: currentPage,
                    per_page: 15,
                    search: searchTerm
                }
            });
            setEmployees(response.data.data || []);
            setCurrentPage(response.data.current_page || 1);
            setLastPage(response.data.last_page || 1);
            setTotal(response.data.total || 0);
        } catch (error) {
            console.error('Failed to load employees:', error);
        }
        setLoading(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchEmployees();
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                    <img
                        src="/assets/images/DPWH_Logo.png"
                        alt="DPWH Logo"
                        className="w-16 h-16 object-contain"
                    />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Employee Directory</h1>
                <p className="text-gray-500 mt-2">Browse DPWH employee service records</p>
                <p className="text-gray-400 text-sm mt-1">{total} employees on record</p>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto">
                <div className="relative">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name..."
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#007aff] focus:ring-2 focus:ring-[#007aff]/20 transition-all"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#010066] hover:bg-[#000055] text-white text-sm font-medium rounded-lg transition-all"
                    >
                        Search
                    </button>
                </div>
            </form>

            {/* Employee Cards Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                        <i className="fas fa-spinner fa-spin text-[#007aff] text-xl"></i>
                    </div>
                </div>
            ) : employees.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-users text-gray-400 text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-600">No employees found</h3>
                    <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {employees.map((employee) => (
                        <Link
                            key={employee.employee_id}
                            to={`/employee/${employee.employee_id}`}
                            className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#010066] to-[#000033] rounded-2xl flex items-center justify-center text-white font-semibold text-lg shrink-0 shadow-md">
                                    {getInitials(`${employee.given_name} ${employee.surname}`)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-[#010066] transition-colors">
                                        {employee.surname}, {employee.given_name}
                                    </h3>
                                    {employee.middle_name && (
                                        <p className="text-gray-400 text-sm truncate">{employee.middle_name}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                        {employee.latest_position && (
                                            <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded-lg text-xs text-gray-600">
                                                <i className="fas fa-briefcase mr-1 text-[#007aff]"></i>
                                                {employee.latest_position}
                                            </span>
                                        )}
                                        <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded-lg text-xs text-gray-600">
                                            <i className="fas fa-file-alt mr-1 text-[#34c759]"></i>
                                            {employee.service_record_count || 0} records
                                        </span>
                                    </div>
                                </div>
                                <i className="fas fa-chevron-right text-gray-300 group-hover:text-[#010066] group-hover:translate-x-1 transition-all"></i>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {lastPage > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <i className="fas fa-chevron-left mr-1"></i> Previous
                    </button>
                    <span className="text-gray-500 text-sm px-4">
                        Page {currentPage} of {lastPage}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(lastPage, p + 1))}
                        disabled={currentPage === lastPage}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        Next <i className="fas fa-chevron-right ml-1"></i>
                    </button>
                </div>
            )}
        </div>
    );
};

export default PublicEmployeeList;
