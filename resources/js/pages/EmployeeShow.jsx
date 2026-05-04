import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Alert from '../components/Alert.jsx';
import ServiceRecordForm from './ServiceRecordForm.jsx';
import ServiceRecordAddForm from './ServiceRecordAddForm.jsx';
import EmploymentTimeline from '../components/EmploymentTimeline.jsx';
import ViewToggle from '../components/ViewToggle.jsx';
import EmployeeForm from './EmployeeForm.jsx';

const EmployeeShow = () => {
    const { id } = useParams();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [parsedRecords, setParsedRecords] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingServiceRecordId, setEditingServiceRecordId] = useState(null);
    const [isEmployeeEditModalOpen, setIsEmployeeEditModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('timeline'); // 'table' or 'timeline'
    const [selectedYear, setSelectedYear] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchEmployee();
    }, [id]);

    const fetchEmployee = async () => {
        try {
            const response = await axios.get(`/api/employees/${id}`);
            setEmployee(response.data);
            setCurrentPage(1); // Reset to first page on load
        } catch (error) {
            setAlert({ message: 'Failed to load employee', type: 'error' });
        }
        setLoading(false);
    };

    const handleDeleteServiceRecord = async (recordId) => {
        if (!confirm('Are you sure you want to delete this service record?')) return;

        try {
            await axios.delete(`/api/service-records/${recordId}`);
            setAlert({ message: 'Service record deleted successfully', type: 'success' });
            setCurrentPage(1); // Reset to first page after delete
            fetchEmployee();
        } catch (error) {
            setAlert({ message: 'Failed to delete service record', type: 'error' });
        }
    };

    const handlePrintPdf = () => {
        window.open(`/reports/service-record/${id}/pdf`, '_blank');
    };

    const handlePrint = () => {
        if (viewMode === 'table') {
            window.print();
        } else {
            // For timeline view, create a print-friendly version
            const printContent = document.getElementById('employment-timeline');
            if (printContent) {
                const originalContent = document.body.innerHTML;
                document.body.innerHTML = printContent.innerHTML;
                window.print();
                document.body.innerHTML = originalContent;
                window.location.reload();
            }
        }
    };

    const handleFileChange = (e) => {
        setImportFile(e.target.files[0]);
    };

    const handleParseExcel = async () => {
        if (!importFile) {
            setAlert({ message: 'Please select an Excel file', type: 'error' });
            return;
        }

        setImporting(true);
        const formData = new FormData();
        formData.append('excel_file', importFile);

        try {
            const response = await axios.post(`/reports/service-record/${id}/parse`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setParsedRecords(response.data.records);
            setShowPreview(true);
        } catch (error) {
            setAlert({ message: error.response?.data?.message || 'Failed to parse Excel', type: 'error' });
        }
        setImporting(false);
    };

    const handleConfirmImport = async () => {
        setImporting(true);
        setCurrentPage(1); // Reset to first page after import
        try {
            const response = await axios.post(`/reports/service-record/${id}/confirm`, {
                records: parsedRecords
            });

            Swal.fire({
                icon: false,
                title: false,
                html: `
                    <div class="flex flex-col items-center text-center">
                        <div class="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <div class="mb-2">
                            <div class="text-xl font-semibold text-gray-900">Import Successful!</div>
                        </div>
                        <div class="text-sm text-gray-600 max-w-xs">
                            ${response.data.message}
                        </div>
                        <div class="mt-4">
                            <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 rounded-full">
                                <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span class="text-xs font-semibold text-emerald-700">Records Added</span>
                            </div>
                        </div>
                    </div>
                `,
                confirmButtonColor: '#010066',
                confirmButtonText: 'Done',
                customClass: {
                    popup: 'ios-import-success',
                    container: 'ios-import-success-container'
                },
                showClass: {
                    popup: 'animate__animated animate__bounceIn'
                },
                hideClass: {
                    popup: 'animate__animated animate__bounceOut'
                }
            });
            setIsImportModalOpen(false);
            setShowPreview(false);
            setParsedRecords([]);
            setImportFile(null);
            fetchEmployee();
        } catch (error) {
            setAlert({ message: error.response?.data?.message || 'Failed to import records', type: 'error' });
        }
        setImporting(false);
    };

    const openImportModal = () => {
        setIsImportModalOpen(true);
        setImportFile(null);
        setParsedRecords([]);
        setShowPreview(false);
    };

    const closeImportModal = () => {
        setIsImportModalOpen(false);
        setImportFile(null);
        setParsedRecords([]);
        setShowPreview(false);
    };

    const handleBackToUpload = () => {
        setShowPreview(false);
        setParsedRecords([]);
    };

    const openAddModal = () => {
        setIsAddModalOpen(true);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        fetchEmployee(); // Refresh the employee data to show changes
    };

    const openEditModal = (recordId) => {
        setEditingServiceRecordId(recordId);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingServiceRecordId(null);
        fetchEmployee(); // Refresh the employee data to show changes
    };

    const openEmployeeEditModal = () => {
        setIsEmployeeEditModalOpen(true);
    };

    const closeEmployeeEditModal = () => {
        setIsEmployeeEditModalOpen(false);
        fetchEmployee(); // Refresh the employee data to show changes
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '-';
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const formatSalary = (amount, unit) => {
        if (!amount) return '-';
        const numericAmount = parseFloat(amount);
        const formatted = numericAmount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        const unitLabels = {
            daily: 'd',
            monthly: 'mo',
            annually: 'yr',
            annual: 'yr'
        };
        return `${formatted}/${unitLabels[unit] || unit}`;
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <i className="fas fa-spinner fa-spin text-gray-600 text-2xl"></i>
                </div>
                <p className="text-gray-600 font-medium">Loading employee information...</p>
            </div>
        </div>
    );
    
    if (!employee) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <i className="fas fa-exclamation-triangle text-gray-600 text-2xl"></i>
                </div>
                <p className="text-gray-600 font-medium">Employee not found</p>
                <Link to="/employees" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
                    <i className="fas fa-arrow-left mr-2"></i>
                    Back to Employees
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {alert?.type === 'error' && <Alert message={alert?.message} type={alert?.type} onClose={() => setAlert(null)} />}

                {/* Navigation Header */}
                <div className="mb-4">
                    <Link 
                        to="/employees" 
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                    >
                        <i className="fas fa-arrow-left mr-2"></i>
                        Back to List of Employees
                    </Link>
                </div>
                
                {/* Employee Info Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-[#010066] mb-2">
                                {employee.surname}, {employee.given_name} {employee.middle_name}
                            </h1>
                            <p className="text-gray-500 text-sm">
                                {employee.birth_date && `Born ${new Date(employee.birth_date).toLocaleDateString()}`}
                                {employee.birth_place && ` in ${employee.birth_place}`}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrintPdf}
                                className="bg-red-600 text-white px-4 py-3 h-10 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                            >
                                <i className="fas fa-file-pdf mr-2"></i>
                                Print PDF
                            </button>
                            <button
                                onClick={openEmployeeEditModal}
                                className="bg-green-600 text-white px-4 py-3 h-10 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                            >
                                <i className="fas fa-edit mr-2"></i>
                                Edit
                            </button>
                        </div>
                    </div>
                </div>

            {/* Service Records Section */}
                <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-semibold text-[#010066]">Service Records</h2>
                                <p className="text-sm text-gray-500">Employment history and timeline</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={openImportModal}
                                    className="bg-green-600 text-white px-4 py-3 h-10 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                                >
                                    <i className="fas fa-file-excel mr-2"></i>
                                    Import Excel
                                </button>
                                <button
                                    onClick={openAddModal}
                                    className="bg-[#010066] text-white px-4 py-3 h-10 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                                >
                                    <i className="fas fa-plus mr-2"></i>
                                    Add Service Record
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">

                {/* View Toggle + Year Filter */}
                <div className="mb-4">
                    <div className="bg-white shadow rounded-lg p-4">
                        <div className="flex justify-between items-center flex-wrap gap-3">
                            <ViewToggle 
                                currentView={viewMode}
                                onViewChange={setViewMode}
                            />
                            {employee.service_records && employee.service_records.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">Year:</span>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => {
                                            setSelectedYear(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">All Years</option>
                                        {[...new Set(employee.service_records.flatMap(r => {
                                            const start = new Date(r.date_from).getFullYear();
                                            const end = r.date_to ? new Date(r.date_to).getFullYear() : new Date().getFullYear();
                                            const years = [];
                                            for (let y = start; y <= end; y++) years.push(y);
                                            return years;
                                        }))]
                                            .sort((a, b) => b - a)
                                            .map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))
                                        }
                                    </select>
                                    <button
                                        onClick={() => setSelectedYear('all')}
                                        className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                                            selectedYear !== 'all'
                                                ? 'bg-white text-gray-600 border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
                                                : 'bg-gray-50 text-gray-300 border-gray-200 cursor-default'
                                        }`}
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {(() => {
                    const filteredRecords = selectedYear === 'all'
                        ? employee.service_records
                        : employee.service_records.filter(r => {
                            const year = parseInt(selectedYear);
                            const startYear = new Date(r.date_from).getFullYear();
                            const endYear = r.date_to ? new Date(r.date_to).getFullYear() : new Date().getFullYear();
                            return year >= startYear && year <= endYear;
                        });

                    // Pagination logic for table view
                    const totalPages = Math.ceil((filteredRecords?.length || 0) / itemsPerPage);
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const paginatedRecords = filteredRecords?.slice(startIndex, endIndex) || [];

                    return (!filteredRecords || filteredRecords.length === 0) ? (
                        <p className="text-gray-500 text-center py-4">
                            No service records found{selectedYear !== 'all' ? ` for ${selectedYear}` : ''}.
                        </p>
                    ) : (
                    <div>
                        {viewMode === 'table' ? (
                            <>
                            <div>
                                <table className="w-full text-xs border-collapse table-fixed">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase">From</th>
                                            <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase">To</th>
                                            <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase">Pos</th>
                                            <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase">Status</th>
                                            <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase">Station</th>
                                            <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase">Branch</th>
                                            <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase">Salary</th>
                                            <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase">LWOP</th>
                                            <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase">Sep. Dt</th>
                                            <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase">Sep. Cause</th>
                                            <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase">Remarks</th>
                                            <th className="px-2 py-2 text-center text-[10px] font-semibold text-gray-600 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {paginatedRecords.map((record, index) => (
                                            <tr key={record.service_id} className={`hover:bg-gray-50 transition-colors ${index % 2 !== 0 ? 'bg-gray-50/30' : ''}`}>
                                                <td className="px-2 py-2 text-gray-900 text-[11px] whitespace-nowrap">{formatDate(record.date_from)}</td>
                                                <td className="px-2 py-2 text-gray-900 text-[11px] whitespace-nowrap">{record.date_to ? formatDate(record.date_to) : <span className="text-emerald-600 font-medium">Present</span>}</td>
                                                <td className="px-2 py-2 text-gray-900 text-[11px] font-medium truncate" title={record.position?.position_name || ''}>{record.position?.position_name || '-'}</td>
                                                <td className="px-2 py-2">
                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                                        record.employment_status?.status_name === 'Permanent' || record.employment_status?.status_name === 'Perm.'
                                                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                                                            : record.employment_status?.status_name === 'Casual'
                                                                ? 'bg-green-100 text-green-700 border-green-200'
                                                                : record.employment_status?.status_name === 'Contract'
                                                                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                                                    }`}>
                                                        {record.employment_status?.status_name?.substring(0, 4) || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2 text-gray-700 text-[11px] truncate" title={record.office?.department || ''}>{record.office?.department || '-'}</td>
                                                <td className="px-2 py-2 text-gray-700 text-[11px] truncate" title={record.office?.branch || ''}>{record.office?.branch || '-'}</td>
                                                <td className="px-2 py-2 text-gray-900 text-[11px] whitespace-nowrap">
                                                    {record.salary_histories && record.salary_histories.length > 0
                                                        ? formatSalary(record.salary_histories[0].amount, record.salary_histories[0].rate_unit)
                                                        : '-'
                                                    }
                                                </td>
                                                <td className="px-2 py-2 text-gray-700 text-[11px] truncate" title={record.leave_records && record.leave_records.length > 0 ? record.leave_records[0].leave_type : ''}>{record.leave_records && record.leave_records.length > 0 ? record.leave_records[0].leave_type : '-'}</td>
                                                <td className="px-2 py-2 text-gray-700 text-[11px] whitespace-nowrap">{record.separation_record?.separation_date ? formatDate(record.separation_record.separation_date) : '-'}</td>
                                                <td className="px-2 py-2 text-gray-700 text-[11px] truncate" title={record.separation_record?.separation_date ? (record.separation_record.cause || '') : ''}>{record.separation_record?.separation_date ? (record.separation_record.cause || '-') : '-'}</td>
                                                <td className="px-2 py-2 text-gray-700 text-[11px] truncate" title={record.remarks || ''}>{record.remarks || '-'}</td>
                                                <td className="px-2 py-2">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <button
                                                            onClick={() => openEditModal(record.service_id)}
                                                            className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition-all duration-200 shadow-sm text-xs font-medium w-full"
                                                        >
                                                            <i className="fas fa-edit mr-1"></i> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteServiceRecord(record.service_id)}
                                                            className="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 transition-all duration-200 shadow-sm text-xs font-medium w-full"
                                                        >
                                                            <i className="fas fa-trash mr-1"></i> Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4 px-2">
                                    <div className="text-sm text-gray-600">
                                        Showing {startIndex + 1} to {Math.min(endIndex, filteredRecords.length)} of {filteredRecords.length} records
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Previous
                                        </button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                                                        currentPage === page
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                            </>
                        ) : (
                            <div id="employment-timeline">
                                <EmploymentTimeline serviceRecords={filteredRecords} />
                            </div>
                        )}
                    </div>
                );
                })()}
            </div>
            </div>

            
            {/* Import Excel Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={closeImportModal}
                    ></div>
                    <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-3xl w-full z-10 border border-gray-200/50">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200/50">
                            <h2 className="text-lg font-semibold text-gray-900">Import Service Records</h2>
                            <button
                                onClick={closeImportModal}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                <i className="fas fa-times text-gray-600 text-sm"></i>
                            </button>
                        </div>
                        {!showPreview ? (
                            <div className="p-3">
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl mb-3 shadow-lg">
                                        <i className="fas fa-file-excel text-white text-xl"></i>
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Import Service Records</h2>
                                    <p className="text-gray-600 text-sm">Upload your Excel file to add service records</p>
                                </div>
                                    
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept=".xlsx,.xls"
                                                onChange={handleFileChange}
                                                className="w-full h-32 border-2 border-dashed border-gray-300/50 rounded-3xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 cursor-pointer bg-gray-50/50 hover:bg-gray-100/50 text-transparent backdrop-blur-sm"
                                            />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                                                    <i className="fas fa-cloud-upload-alt text-emerald-600 text-lg"></i>
                                                </div>
                                                <p className="text-gray-700 font-medium text-sm mb-1">Drop Excel file here</p>
                                                <p className="text-xs text-gray-500">or click to browse</p>
                                            </div>
                                        </div>
                                        
                                        {importFile && (
                                            <div className="flex items-center gap-3 p-3 bg-emerald-50/80 backdrop-blur-sm rounded-2xl border border-emerald-200/50">
                                                <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                                                    <i className="fas fa-file-excel text-emerald-600 text-sm"></i>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{importFile.name}</p>
                                                    <p className="text-xs text-gray-500">{(importFile.size / 1024).toFixed(2)} KB</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setImportFile(null)}
                                                    className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                                >
                                                    <i className="fas fa-times text-gray-600 text-xs"></i>
                                                </button>
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-between gap-3 pt-4 border-t border-gray-200/50">
                                            <button
                                                type="button"
                                                onClick={closeImportModal}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors text-sm font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleParseExcel}
                                                disabled={!importFile || importing}
                                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
                                            >
                                                {importing && (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                )}
                                                {importing ? 'Parsing...' : 'Parse Excel'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                            <div className="p-3">
                                <div className="flex items-center justify-between mb-6">
                                    <button
                                        type="button"
                                        onClick={handleBackToUpload}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                    >
                                        <i className="fas fa-arrow-left text-gray-600 text-sm"></i>
                                    </button>
                                    <div className="text-center flex-1">
                                        <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl mb-2 shadow-lg">
                                            <i className="fas fa-check text-white text-lg"></i>
                                        </div>
                                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Review Records</h2>
                                        <p className="text-gray-600 text-sm">
                                            Found <strong>{parsedRecords.length}</strong> service record{parsedRecords.length !== 1 ? 's' : ''} to import
                                        </p>
                                    </div>
                                    <div className="w-8 h-8"></div>
                                </div>
                                
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl mb-4 overflow-hidden border border-gray-200/50 shadow-sm">
                                    <div className="max-h-80 overflow-y-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50/80 backdrop-blur-sm text-gray-700 sticky top-0 z-30 border-b border-gray-200/50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-semibold text-xs">FROM</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-xs">TO</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-xs">DESIGNATION</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-xs">STATUS</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-xs">SALARY</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-xs">STATION</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-xs">SEP. DATE</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-xs">SEP. CAUSE</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200/50">
                                                {[...parsedRecords].sort((a, b) => new Date(b.date_from) - new Date(a.date_from)).map((record, index) => (
                                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{formatDate(record.date_from)}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{record.date_to ? formatDate(record.date_to) : <span className="inline-flex px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full">Present</span>}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{record.designation || '-'}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{record.status || '-'}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{record.salary ? record.salary.toLocaleString() : '-'}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{record.station || '-'}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{record.separation_date ? formatDate(record.separation_date) : '-'}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{record.separation_cause || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between gap-3 pt-4 border-t border-gray-200/50">
                                    <button
                                        type="button"
                                        onClick={closeImportModal}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmImport}
                                        disabled={importing}
                                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
                                    >
                                        {importing && (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        )}
                                        {importing ? 'Importing...' : 'Import Records'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Edit Employee Modal */}
            <EmployeeForm
                isOpen={isEmployeeEditModalOpen}
                onClose={closeEmployeeEditModal}
                employeeId={id}
                onSuccess={() => {
                    fetchEmployee();
                    closeEmployeeEditModal();
                }}
            />

            {/* Add Service Record Modal */}
            <ServiceRecordAddForm
                isOpen={isAddModalOpen}
                onClose={closeAddModal}
                employeeId={id}
            />

            {/* Edit Service Record Modal */}
            {isEditModalOpen && (
                <ServiceRecordForm
                    key={editingServiceRecordId}
                    isOpen={isEditModalOpen}
                    onClose={closeEditModal}
                    serviceRecordId={editingServiceRecordId}
                    employeeId={id}
                />
            )}
        </div>
    </div>
    
    );
};

export default EmployeeShow;
