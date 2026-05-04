import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Pagination from '../components/Pagination.jsx';

const EmployeeView = () => {
    const { id } = useParams();
    const [employee, setEmployee] = useState(null);
    const [serviceRecords, setServiceRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('table');
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
    });

    useEffect(() => {
        fetchEmployee();
    }, [id]);

    const fetchEmployee = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/employees/${id}?page=${page}`);
            setEmployee(response.data.employee);
            setServiceRecords(response.data.service_records?.data || []);
            setPagination({
                current_page: response.data.service_records?.current_page || 1,
                last_page: response.data.service_records?.last_page || 1,
                per_page: response.data.service_records?.per_page || 10,
                total: response.data.service_records?.total || 0
            });
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Failed to load employee details',
                customClass: {
                    popup: 'ios-error-popup',
                    title: 'ios-error-title',
                    htmlContainer: 'ios-error-content',
                    confirmButton: 'ios-error-button'
                }
            });
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
            <div className="w-12 h-12 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-sm border border-gray-200/50">
                <i className="fas fa-spinner fa-spin text-[#007aff] text-xl"></i>
            </div>
        </div>
    );

    if (!employee) return (
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-user-slash text-gray-400 text-2xl"></i>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Employee Not Found</h2>
            <p className="text-gray-500 mt-2">The requested employee could not be found.</p>
            <Link to="/employees" className="mt-4 inline-block text-[#007aff] hover:text-[#0056b3] font-medium">
                Back to Employee List
            </Link>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        to="/employees"
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100/80 text-gray-600 hover:bg-gray-200/80 transition-all"
                    >
                        <i className="fas fa-arrow-left"></i>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                            Employee Details
                        </h1>
                        <p className="text-sm text-gray-500">View service record information</p>
                    </div>
                </div>
            </div>

            {/* Employee Info Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-sm p-6">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#007aff] to-[#5856d6] rounded-2xl flex items-center justify-center text-white shadow-md shrink-0">
                        <i className="fas fa-user text-2xl"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
                            {employee.surname}, {employee.given_name} {employee.middle_name}
                        </h2>
                        <div className="flex flex-wrap gap-3 mt-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100/80 rounded-lg text-sm text-gray-600">
                                <i className="fas fa-birthday-cake text-[#007aff]"></i>
                                {employee.birth_date || 'N/A'}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100/80 rounded-lg text-sm text-gray-600">
                                <i className="fas fa-map-marker-alt text-[#007aff]"></i>
                                {employee.birth_place || 'N/A'}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#34c759]/10 rounded-lg text-sm text-[#34c759] font-medium">
                                <i className="fas fa-clock"></i>
                                {calculateYearsOfService(serviceRecords)} Years of Service
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#007aff]/10 rounded-lg text-sm text-[#007aff] font-medium">
                                <i className="fas fa-file-alt"></i>
                                {pagination.total} Service Records
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Records */}
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-200/50">
                    <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Service Records</h3>
                    <div className="flex bg-gray-100/80 rounded-xl p-1">
                        <button
                            onClick={() => setActiveTab('table')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeTab === 'table'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <i className="fas fa-table mr-2"></i>Table
                        </button>
                        <button
                            onClick={() => setActiveTab('timeline')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeTab === 'timeline'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <i className="fas fa-stream mr-2"></i>Timeline
                        </button>
                    </div>
                </div>

                {serviceRecords.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-inbox text-gray-400 text-2xl"></i>
                        </div>
                        <p className="text-gray-500">No service records found for this employee.</p>
                    </div>
                ) : activeTab === 'table' ? (
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
                                {serviceRecords.map((record) => {
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
                                                {salary ? `₱${parseFloat(salary.amount).toLocaleString()}${salary.rate_unit === 'daily' ? '/day' : salary.rate_unit === 'monthly' ? '/mo' : '/yr'}` : '-'}
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
                ) : (
                    <div className="p-5 space-y-4">
                        {serviceRecords.map((record, index) => {
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
                )}

                {pagination.total > 10 && (
                    <div className="p-4 border-t border-gray-200/50">
                        <Pagination
                            data={pagination}
                            onPageChange={fetchEmployee}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeView;
