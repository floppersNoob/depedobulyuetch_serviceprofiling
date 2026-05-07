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
        const result = await Swal.fire({
            title: 'Delete Record?',
            text: 'This action cannot be undone.',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(`/api/service-records/${recordId}`);
            setCurrentPage(1);
            fetchEmployee();
        } catch (error) {
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
                title: 'Import Successful!',
                text: response.data.message,
                confirmButtonColor: '#010066',
                confirmButtonText: 'Done'
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
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
                <i className="fas fa-spinner fa-spin text-[#010066] text-2xl"></i>
                <p className="text-gray-500 font-medium text-sm mt-3">Loading...</p>
            </div>
        </div>
    );
    
    if (!employee) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
                <i className="fas fa-exclamation-triangle text-orange-500 text-2xl"></i>
                <p className="text-gray-500 font-medium text-sm mt-3">Employee not found</p>
                <Link to="/employees" className="mt-4 inline-flex items-center text-[#010066] hover:text-[#000055] font-medium text-sm transition-colors">
                    <i className="fas fa-chevron-left mr-2 text-xs"></i>
                    Back to Employees
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {alert?.type === 'error' && <Alert message={alert?.message} type={alert?.type} onClose={() => setAlert(null)} />}

                {/* Navigation Header */}
                <div className="mb-5">
                    <Link 
                        to="/employees" 
                        className="inline-flex items-center text-[#010066] hover:text-[#000055] font-medium text-sm transition-colors"
                    >
                        <i className="fas fa-chevron-left mr-2 text-xs"></i>
                        Employees
                    </Link>
                </div>
                
                {/* Employee Info */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 w-full">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#010066] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {employee.given_name?.[0]}{employee.surname?.[0]}
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">
                                    {employee.surname}, {employee.given_name} {employee.middle_name}
                                </h1>
                                <p className="text-gray-400 text-sm">
                                    {employee.birth_date && `Born ${new Date(employee.birth_date).toLocaleDateString()}`}
                                    {employee.birth_place && ` · ${employee.birth_place}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrintPdf}
                                className="bg-red-50 text-red-500 px-3 py-2 rounded-lg hover:bg-red-100 transition-all text-sm font-medium"
                            >
                                <i className="fas fa-file-pdf mr-1.5"></i>
                                Print PDF
                            </button>
                            <button
                                onClick={openEmployeeEditModal}
                                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium"
                            >
                                <i className="fas fa-pencil-alt mr-1.5"></i>
                                Edit
                            </button>
                        </div>
                    </div>
                </div>

            {/* Service Records Section */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden w-full">
                    <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">Service Records</h2>
                                <p className="text-xs text-gray-400">Employment history</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={openImportModal}
                                    className="bg-green-50 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100 transition-all text-sm font-medium"
                                >
                                    <i className="fas fa-file-excel mr-1.5"></i>
                                    Import Excel
                                </button>
                                <button
                                    onClick={openAddModal}
                                    className="bg-[#010066] text-white px-3 py-2 rounded-lg hover:bg-[#000055] transition-all text-sm font-medium"
                                >
                                    <i className="fas fa-plus mr-1.5"></i>
                                    Add Service Record
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">

                {/* View Toggle + Year Filter */}
                <div className="mb-4">
                    <div className="rounded-lg p-3 border border-gray-200">
                        <div className="flex justify-between items-center flex-wrap gap-3">
                            <ViewToggle 
                                currentView={viewMode}
                                onViewChange={setViewMode}
                            />
                            {employee.service_records && employee.service_records.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => {
                                            setSelectedYear(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#010066]/20 focus:border-[#010066] transition-all"
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
                                    {selectedYear !== 'all' && (
                                        <button
                                            onClick={() => { setSelectedYear('all'); setCurrentPage(1); }}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 transition-colors text-gray-400"
                                        >
                                            <i className="fas fa-times text-xs"></i>
                                        </button>
                                    )}
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
                        <div className="text-center py-12">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <i className="fas fa-folder-open text-gray-300 text-lg"></i>
                            </div>
                            <p className="text-gray-400 text-sm">
                                No service records{selectedYear !== 'all' ? ` for ${selectedYear}` : ''}
                            </p>
                        </div>
                    ) : (
                    <div>
                        {viewMode === 'table' ? (
                            <>
                            <div className="rounded-xl overflow-hidden border border-gray-200/60">
                                <table className="w-full text-xs border-collapse table-fixed">
                                    <thead>
                                        <tr className="bg-gray-50/80 border-b border-gray-200/60">
                                            <th className="px-2 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">From</th>
                                            <th className="px-2 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">To</th>
                                            <th className="px-2 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pos</th>
                                            <th className="px-2 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="px-2 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Station</th>
                                            <th className="px-2 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Branch</th>
                                            <th className="px-2 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Salary</th>
                                            <th className="px-2 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">LWOP</th>
                                            <th className="px-2 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Sep. Dt</th>
                                            <th className="px-2 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Sep. Cause</th>
                                            <th className="px-2 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Remarks</th>
                                            <th className="px-2 py-2.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {paginatedRecords.map((record, index) => (
                                            <tr key={record.service_id} className={`hover:bg-[#007aff]/5 transition-colors`}>
                                                <td className="px-2 py-2.5 text-gray-900 text-[11px] whitespace-nowrap font-medium">{formatDate(record.date_from)}</td>
                                                <td className="px-2 py-2.5 text-gray-900 text-[11px] whitespace-nowrap">{record.date_to ? formatDate(record.date_to) : <span className="text-[#34c759] font-semibold bg-[#34c759]/10 px-1.5 py-0.5 rounded-md text-[10px]">Present</span>}</td>
                                                <td className="px-2 py-2.5 text-gray-900 text-[11px] font-medium truncate" title={record.position?.position_name || ''}>{record.position?.position_name || '-'}</td>
                                                <td className="px-2 py-2.5">
                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${
                                                        record.employment_status?.status_name === 'Permanent' || record.employment_status?.status_name === 'Perm.'
                                                            ? 'bg-[#007aff]/10 text-[#007aff]'
                                                            : record.employment_status?.status_name === 'Casual'
                                                                ? 'bg-[#34c759]/10 text-[#34c759]'
                                                                : record.employment_status?.status_name === 'Contract'
                                                                    ? 'bg-[#ff9500]/10 text-[#ff9500]'
                                                                    : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                        {record.employment_status?.status_name?.substring(0, 4) || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2.5 text-gray-500 text-[11px] truncate" title={record.office?.department || ''}>{record.office?.department || '-'}</td>
                                                <td className="px-2 py-2.5 text-gray-500 text-[11px] truncate" title={record.office?.branch || ''}>{record.office?.branch || '-'}</td>
                                                <td className="px-2 py-2.5 text-gray-900 text-[11px] whitespace-nowrap font-medium">
                                                    {record.salary_histories && record.salary_histories.length > 0
                                                        ? formatSalary(record.salary_histories[0].amount, record.salary_histories[0].rate_unit)
                                                        : '-'
                                                    }
                                                </td>
                                                <td className="px-2 py-2.5 text-gray-500 text-[11px] truncate" title={record.leave_records && record.leave_records.length > 0 ? record.leave_records[0].leave_type : ''}>{record.leave_records && record.leave_records.length > 0 ? record.leave_records[0].leave_type : '-'}</td>
                                                <td className="px-2 py-2.5 text-gray-500 text-[11px] whitespace-nowrap">{record.separation_record?.separation_date ? formatDate(record.separation_record.separation_date) : '-'}</td>
                                                <td className="px-2 py-2.5 text-gray-500 text-[11px] truncate" title={record.separation_record?.separation_date ? (record.separation_record.cause || '') : ''}>{record.separation_record?.separation_date ? (record.separation_record.cause || '-') : '-'}</td>
                                                <td className="px-2 py-2.5 text-gray-500 text-[11px] truncate" title={record.remarks || ''}>{record.remarks || '-'}</td>
                                                <td className="px-2 py-2.5">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() => openEditModal(record.service_id)}
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#007aff]/10 text-[#007aff] hover:bg-[#007aff]/20 transition-all duration-200"
                                                            title="Edit"
                                                        >
                                                            <i className="fas fa-pencil-alt text-[10px]"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteServiceRecord(record.service_id)}
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#ff3b30]/10 text-[#ff3b30] hover:bg-[#ff3b30]/20 transition-all duration-200"
                                                            title="Delete"
                                                        >
                                                            <i className="fas fa-trash text-[10px]"></i>
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
                                <div className="flex items-center justify-between mt-4 px-1">
                                    <div className="text-xs text-gray-400">
                                        {startIndex + 1}–{Math.min(endIndex, filteredRecords.length)} of {filteredRecords.length}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100/80 hover:bg-gray-200/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-500 text-xs"
                                        >
                                            <i className="fas fa-chevron-left"></i>
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                                                    currentPage === page
                                                        ? 'bg-[#007aff] text-white shadow-sm'
                                                        : 'bg-gray-100/80 text-gray-500 hover:bg-gray-200/80'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100/80 hover:bg-gray-200/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-500 text-xs"
                                        >
                                            <i className="fas fa-chevron-right"></i>
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
                        className="absolute inset-0 bg-black/20"
                        onClick={closeImportModal}
                    ></div>
                    <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full z-10 border border-gray-200">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200">
                            <h2 className="text-base font-semibold text-gray-900">Import Service Records</h2>
                            <button
                                onClick={closeImportModal}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                <i className="fas fa-times text-gray-600 text-sm"></i>
                            </button>
                        </div>
                        {!showPreview ? (
                            <div className="p-4">
                                <div className="text-center mb-4">
                                    <i className="fas fa-file-excel text-green-600 text-2xl mb-2"></i>
                                    <h2 className="text-base font-semibold text-gray-900 mb-1">Import Service Records</h2>
                                    <p className="text-gray-500 text-sm">Upload your Excel file to add service records</p>
                                </div>
                                    
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept=".xlsx,.xls"
                                                onChange={handleFileChange}
                                                className="w-full h-28 border-2 border-dashed border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all cursor-pointer bg-gray-50 hover:bg-gray-100 text-transparent"
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
                                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <i className="fas fa-file-excel text-green-600 text-sm"></i>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{importFile.name}</p>
                                                    <p className="text-xs text-gray-500">{(importFile.size / 1024).toFixed(2)} KB</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setImportFile(null)}
                                                    className="w-6 h-6 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                                >
                                                    <i className="fas fa-times text-gray-600 text-xs"></i>
                                                </button>
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-between gap-3 pt-4 border-t border-gray-200">
                                            <button
                                                type="button"
                                                onClick={closeImportModal}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleParseExcel}
                                                disabled={!importFile || importing}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        type="button"
                                        onClick={handleBackToUpload}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                    >
                                        <i className="fas fa-arrow-left text-gray-600 text-sm"></i>
                                    </button>
                                    <div className="text-center flex-1">
                                        <i className="fas fa-check text-green-600 text-xl mb-1"></i>
                                        <h2 className="text-base font-semibold text-gray-900">Review Records</h2>
                                        <p className="text-gray-500 text-sm">
                                            Found <strong>{parsedRecords.length}</strong> service record{parsedRecords.length !== 1 ? 's' : ''} to import
                                        </p>
                                    </div>
                                    <div className="w-8 h-8"></div>
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg mb-4 overflow-hidden border border-gray-200">
                                    <div className="max-h-80 overflow-y-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-100 text-gray-700 sticky top-0 z-30 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-medium text-xs">FROM</th>
                                                    <th className="px-4 py-3 text-left font-medium text-xs">TO</th>
                                                    <th className="px-4 py-3 text-left font-medium text-xs">DESIGNATION</th>
                                                    <th className="px-4 py-3 text-left font-medium text-xs">STATUS</th>
                                                    <th className="px-4 py-3 text-left font-medium text-xs">SALARY</th>
                                                    <th className="px-4 py-3 text-left font-medium text-xs">STATION</th>
                                                    <th className="px-4 py-3 text-left font-medium text-xs">SEP. DATE</th>
                                                    <th className="px-4 py-3 text-left font-medium text-xs">SEP. CAUSE</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {[...parsedRecords].sort((a, b) => new Date(b.date_from) - new Date(a.date_from)).map((record, index) => (
                                                    <tr key={index} className="hover:bg-gray-100 transition-colors">
                                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{formatDate(record.date_from)}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{record.date_to ? formatDate(record.date_to) : <span className="inline-flex px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">Present</span>}</td>
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
                                
                                <div className="flex justify-between gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={closeImportModal}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmImport}
                                        disabled={importing}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
