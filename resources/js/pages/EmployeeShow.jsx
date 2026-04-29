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

    useEffect(() => {
        fetchEmployee();
    }, [id]);

    const fetchEmployee = async () => {
        try {
            const response = await axios.get(`/api/employees/${id}`);
            setEmployee(response.data);
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
            daily: 'daily',
            monthly: 'monthly',
            annually: 'annually',
            annual: 'annually'
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

                {/* View Toggle */}
                <div className="mb-4">
                    <ViewToggle 
                        currentView={viewMode}
                        onViewChange={setViewMode}
                    />
                </div>

                {!employee.service_records || employee.service_records.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                        No service records found.
                    </p>
                ) : (
                    <div>
                        {viewMode === 'table' ? (
                            <div>
                                <table className="w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period (mm/dd/yyyy)</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Station/Place</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave w/o Pay</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Separation Date</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Separation Cause</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {employee.service_records.map((record) => (
                                            <tr key={record.service_id}>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    {formatDate(record.date_from)}
                                                    {record.date_to
                                                        ? ` - ${formatDate(record.date_to)}`
                                                        : ' - Present'
                                                    }
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {record.position?.position_name || '-'}
                                                </td>

                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    {record.employment_status?.status_name || '-'}
                                                </td>
                                                
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    {record.salary_histories && record.salary_histories.length > 0
                                                        ? formatSalary(record.salary_histories[0].amount, record.salary_histories[0].rate_unit)
                                                        : '-'
                                                    }
                                                </td>

                                                <td className="px-4 py-3 text-sm">
                                                    {record.office?.department || '-'}
                                                </td>

                                                <td className="px-4 py-3 text-sm">{record.office?.branch || '-'}</td>

                                                <td className="px-4 py-3 text-sm">
                                                    {record.leave_records && record.leave_records.length > 0 ? record.leave_records[0].leave_type : '-'}
                                                </td>

                                                <td className="px-4 py-3 text-sm">
                                                    {formatDate(record.separation_record?.separation_date)}
                                                </td>

                                                <td className="px-4 py-3 text-sm">
                                                    {record.separation_record?.cause || '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                                                    <button
                                                        onClick={() => openEditModal(record.service_id)}
                                                        className="bg-green-600 text-white px-3 py-2 h-8 rounded hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md text-xs font-medium"
                                                    >
                                                        <i className="fas fa-edit mr-1"></i>
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteServiceRecord(record.service_id)}
                                                        className="bg-red-600 text-white px-3 py-2 h-8 rounded hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md text-xs font-medium"
                                                    >
                                                        <i className="fas fa-trash mr-1"></i>
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div id="employment-timeline">
                                <EmploymentTimeline serviceRecords={employee.service_records} />
                            </div>
                        )}
                    </div>
                )}
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
