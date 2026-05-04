import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const PublicEmployeeView = () => {
    const { id } = useParams();
    const [employee, setEmployee] = useState(null);
    const [serviceRecords, setServiceRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('table');
    const [selectedYear, setSelectedYear] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchEmployee();
    }, [id]);

    const fetchEmployee = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/public/employees/${id}`);
            setEmployee(response.data.employee);
            setServiceRecords(response.data.service_records || []);
        } catch (error) {
            console.error('Failed to load employee:', error);
        }
        setLoading(false);
    };

    const calculateYearsOfService = (records) => {
        if (!records || records.length === 0) return 0;
        let totalDays = 0;
        records.forEach(record => {
            const from = new Date(record.date_from);
            const to = record.date_to ? new Date(record.date_to) : new Date();
            totalDays += (to - from) / (1000 * 60 * 60 * 24);
        });
        return (totalDays / 365.25).toFixed(2);
    };

    if (loading) return (
        <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                <i className="fas fa-spinner fa-spin text-[#007aff] text-xl"></i>
            </div>
        </div>
    );

    if (!employee) return (
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-user-slash text-gray-400 text-2xl"></i>
            </div>
            <h2 className="text-lg font-semibold text-gray-600">Employee Not Found</h2>
            <Link to="/" className="mt-4 inline-block text-[#007aff] hover:text-[#0056b3] font-medium transition-colors">
                <i className="fas fa-arrow-left mr-2"></i>Back to Directory
            </Link>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Back Link */}
            <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium">
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Employee Directory
            </Link>

            {/* Employee Info Card */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#010066] to-[#000033] rounded-2xl flex items-center justify-center text-white shadow-md shrink-0">
                        <i className="fas fa-user text-2xl"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {employee.surname}, {employee.given_name} {employee.middle_name}
                        </h2>
                        <div className="flex flex-wrap gap-3 mt-3">
                            {employee.birth_date && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-600">
                                    <i className="fas fa-birthday-cake text-[#007aff]"></i>
                                    {employee.birth_date}
                                </span>
                            )}
                            {employee.birth_place && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-600">
                                    <i className="fas fa-map-marker-alt text-[#007aff]"></i>
                                    {employee.birth_place}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#34c759]/10 rounded-lg text-sm text-[#34c759] font-medium">
                                <i className="fas fa-clock"></i>
                                {calculateYearsOfService(serviceRecords)} Years of Service
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#007aff]/10 rounded-lg text-sm text-[#007aff] font-medium">
                                <i className="fas fa-file-alt"></i>
                                {serviceRecords.length} Service Records
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Records */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-200/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Service Records</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Search */}
                            <div className="relative">
                                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    placeholder="Search records..."
                                    className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#007aff] focus:ring-1 focus:ring-[#007aff]/30 transition-all w-40"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <i className="fas fa-times text-xs"></i>
                                    </button>
                                )}
                            </div>
                            {/* Year Filter */}
                            <select
                                value={selectedYear}
                                onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
                                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#007aff] focus:ring-1 focus:ring-[#007aff]/30 transition-all"
                            >
                                <option value="all">All Years</option>
                                {[...new Set(serviceRecords.flatMap(r => {
                                    const start = new Date(r.date_from).getFullYear();
                                    const end = r.date_to ? new Date(r.date_to).getFullYear() : new Date().getFullYear();
                                    const years = [];
                                    for (let y = start; y <= end; y++) years.push(y);
                                    return years;
                                }))].sort((a, b) => b - a).map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            {/* View Toggle */}
                            <div className="flex bg-gray-100 rounded-xl p-1">
                                <button
                                    onClick={() => setActiveTab('table')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        activeTab === 'table'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <i className="fas fa-table mr-1"></i>Table
                                </button>
                                <button
                                    onClick={() => setActiveTab('timeline')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        activeTab === 'timeline'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <i className="fas fa-stream mr-1"></i>Timeline
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {(() => {
                    // Filter records
                    let filtered = serviceRecords;

                    // Year filter
                    if (selectedYear !== 'all') {
                        const year = parseInt(selectedYear);
                        filtered = filtered.filter(r => {
                            const startYear = new Date(r.date_from).getFullYear();
                            const endYear = r.date_to ? new Date(r.date_to).getFullYear() : new Date().getFullYear();
                            return year >= startYear && year <= endYear;
                        });
                    }

                    // Search filter
                    if (searchQuery.trim()) {
                        const q = searchQuery.toLowerCase();
                        filtered = filtered.filter(r =>
                            (r.position?.position_name || '').toLowerCase().includes(q) ||
                            (r.employment_status?.status_name || '').toLowerCase().includes(q) ||
                            (r.station_place || '').toLowerCase().includes(q) ||
                            (r.branch || '').toLowerCase().includes(q) ||
                            (r.remarks || '').toLowerCase().includes(q)
                        );
                    }

                    // Pagination for table view
                    const totalPages = activeTab === 'table' ? Math.ceil((filtered?.length || 0) / itemsPerPage) : 1;
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const paginatedRecords = activeTab === 'table' ? filtered?.slice(startIndex, endIndex) || [] : filtered;

                    return filtered.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-inbox text-gray-400 text-2xl"></i>
                        </div>
                        <p className="text-gray-500">No service records found for this employee.</p>
                    </div>
                ) : activeTab === 'table' ? (
                    <div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/80">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Period</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Designation</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Station</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Branch</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Salary</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {paginatedRecords.map((record) => {
                                    const salary = record.salary_histories?.[0];
                                    const days = (new Date(record.date_to || new Date()) - new Date(record.date_from)) / (1000 * 60 * 60 * 24);
                                    const years = (days / 365.25).toFixed(1);

                                    return (
                                        <tr key={record.service_id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {record.date_from} - {record.date_to || 'Present'}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-0.5">{years} years</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                {record.position?.position_name || '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                                                    record.employment_status?.status_name?.toLowerCase() === 'permanent'
                                                        ? 'bg-[#34c759]/10 text-[#34c759]'
                                                        : record.employment_status?.status_name?.toLowerCase() === 'casual'
                                                            ? 'bg-[#ff9500]/10 text-[#ff9500]'
                                                            : 'bg-[#007aff]/10 text-[#007aff]'
                                                }`}>
                                                    {record.employment_status?.status_name || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                {record.station_place || '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                {record.branch || '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                {salary ? `₱${parseFloat(salary.amount).toLocaleString()}` : '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate">
                                                {record.remarks || '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                            <div className="text-xs text-gray-400">
                                {startIndex + 1}–{Math.min(endIndex, filtered.length)} of {filtered.length}
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-500 text-xs"
                                >
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let page;
                                    if (totalPages <= 5) {
                                        page = i + 1;
                                    } else if (currentPage <= 3) {
                                        page = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        page = totalPages - 4 + i;
                                    } else {
                                        page = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                                                currentPage === page
                                                    ? 'bg-[#007aff] text-white shadow-sm'
                                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-500 text-xs"
                                >
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    )}
                    </div>
                ) : (
                    <div className="p-5 space-y-4">
                        {serviceRecords.map((record) => {
                            const salary = record.salary_histories?.[0];
                            return (
                                <div key={record.service_id} className="relative pl-6 pb-4 border-l-2 border-gray-200 last:pb-0">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#007aff] border-4 border-white shadow-sm"></div>
                                    <div className="bg-gray-50/80 rounded-xl p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-900">{record.position?.position_name || 'No Designation'}</p>
                                                <p className="text-sm text-gray-500 mt-1">{record.employment_status?.status_name || 'No Status'}</p>
                                            </div>
                                            <span className="text-xs font-medium text-gray-400 bg-white px-2 py-1 rounded-lg border border-gray-200">
                                                {record.date_from} - {record.date_to || 'Present'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3 text-xs text-gray-500">
                                            {record.station_place && (
                                                <span className="bg-white px-2 py-1 rounded-lg border border-gray-200">
                                                    <i className="fas fa-map-marker-alt mr-1 text-[#007aff]"></i>
                                                    {record.station_place}
                                                </span>
                                            )}
                                            {record.branch && (
                                                <span className="bg-white px-2 py-1 rounded-lg border border-gray-200">
                                                    <i className="fas fa-building mr-1 text-[#007aff]"></i>
                                                    {record.branch}
                                                </span>
                                            )}
                                            {salary && (
                                                <span className="bg-white px-2 py-1 rounded-lg border border-gray-200">
                                                    <i className="fas fa-money-bill mr-1 text-[#34c759]"></i>
                                                    ₱{parseFloat(salary.amount).toLocaleString()}
                                                </span>
                                            )}
                                            {record.remarks && (
                                                <span className="bg-white px-2 py-1 rounded-lg border border-gray-200">
                                                    <i className="fas fa-comment mr-1 text-gray-400"></i>
                                                    {record.remarks}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            })()}
            </div>
        </div>
    );
};

export default PublicEmployeeView;
