import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Alert from '../components/Alert.jsx';
import ServiceRecordForm from './ServiceRecordForm.jsx';
import ServiceRecordAddForm from './ServiceRecordAddForm.jsx';
import EmploymentTimeline from '../components/EmploymentTimeline.jsx';
import ViewToggle from '../components/ViewToggle.jsx';

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
                icon: 'success',
                title: 'Success!',
                text: response.data.message,
                confirmButtonColor: '#10b981'
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <i className="fas fa-spinner fa-spin text-blue-600 text-2xl"></i>
                </div>
                <p className="text-gray-600 font-medium">Loading employee information...</p>
            </div>
        </div>
    );
    
    if (!employee) return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {alert?.type === 'error' && <Alert message={alert?.message} type={alert?.type} onClose={() => setAlert(null)} />}

                {/* Navigation Header */}
                <div className="mb-8">
                    <Link 
                        to="/employees" 
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                    >
                        <i className="fas fa-arrow-left mr-2"></i>
                        Back to Employees
                    </Link>
                </div>
                
                {/* Employee Info Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    {employee.surname}, {employee.given_name} {employee.middle_name}
                                </h1>
                                <p className="text-blue-100">
                                    {employee.birth_date && `Born ${new Date(employee.birth_date).toLocaleDateString()}`}
                                    {employee.birth_place && ` in ${employee.birth_place}`}
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handlePrintPdf}
                                    className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20"
                                >
                                    <i className="fas fa-file-pdf mr-2"></i>
                                    Print PDF
                                </button>
                                <Link
                                    to={`/employees/${id}/edit`}
                                    className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20"
                                >
                                    <i className="fas fa-edit mr-2"></i>
                                    Edit
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

            {/* Service Records Section */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl w-10 h-10 flex items-center justify-center shadow-lg">
                                    <i className="fas fa-briefcase"></i>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Service Records</h2>
                                    <p className="text-sm text-gray-500">Employment history and timeline</p>
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={openImportModal}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-medium hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    <i className="fas fa-file-excel mr-2"></i>
                                    Import Excel
                                </button>
                                <button
                                    onClick={openAddModal}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    <i className="fas fa-plus mr-2"></i>
                                    Add Service Record
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">

                {/* View Toggle */}
                <ViewToggle 
                    currentView={viewMode}
                    onViewChange={setViewMode}
                />

                {!employee.service_records || employee.service_records.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        No service records found.{' '}
                        <button onClick={openAddModal} className="text-blue-600 hover:underline">
                            Add one
                        </button>
                    </p>
                ) : (
                    <div>
                        {viewMode === 'table' ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
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
                                                        className="text-yellow-600 hover:text-yellow-900"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteServiceRecord(record.service_id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
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
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={closeImportModal}
                    ></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full z-10 transform transition-all duration-300 scale-100">
                        {!showPreview ? (
                            <>
                                <div className="p-8">
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl mb-4 shadow-lg">
                                            <i className="fas fa-file-excel text-white text-2xl"></i>
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Service Records</h2>
                                        <p className="text-gray-600">Upload your Excel file to add service records</p>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept=".xlsx,.xls"
                                                onChange={handleFileChange}
                                                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 cursor-pointer bg-gray-50 hover:bg-gray-100 text-transparent"
                                            />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                                                <p className="text-gray-600 font-medium">Drop Excel file here</p>
                                                <p className="text-sm text-gray-500">or click to browse</p>
                                            </div>
                                        </div>
                                        
                                        {importFile && (
                                            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                                <div className="flex-shrink-0">
                                                    <i className="fas fa-file-excel text-emerald-600 text-lg"></i>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-emerald-900 truncate">{importFile.name}</p>
                                                    <p className="text-xs text-emerald-700">Ready to parse</p>
                                                </div>
                                                <button
                                                    onClick={() => setImportFile(null)}
                                                    className="flex-shrink-0 text-emerald-600 hover:text-emerald-800 transition-colors"
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        )}
                                        
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <h3 className="text-sm font-semibold text-gray-700 mb-2">File Requirements</h3>
                                            <ul className="text-xs text-gray-600 space-y-1">
                                                <li className="flex items-center gap-2">
                                                    <i className="fas fa-check-circle text-emerald-500 text-xs"></i>
                                                    Excel format (.xlsx, .xls)
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <i className="fas fa-check-circle text-emerald-500 text-xs"></i>
                                                    Include service record columns
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <i className="fas fa-check-circle text-emerald-500 text-xs"></i>
                                                    Valid date formats
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="flex justify-between pt-4 border-t border-gray-200/50">
                                        <button
                                            type="button"
                                            onClick={closeImportModal}
                                            className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all duration-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleParseExcel}
                                            disabled={importing || !importFile}
                                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                                        >
                                            {importing ? (
                                                <span className="flex items-center gap-2">
                                                    <i className="fas fa-spinner fa-spin"></i>
                                                    Parsing...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <i className="fas fa-file-excel"></i>
                                                    Parse Excel
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                            ) : (
                            <div className="p-8">
                                <div className="flex items-start mb-6">
                                    <button
                                        type="button"
                                        onClick={handleBackToUpload}
                                        className="px-4 py-2 rounded-xl bg-gray-600 text-white font-medium hover:bg-gray-700 transition-all duration-200 text-sm"
                                    >
                                        <i className="fas fa-arrow-left mr-2"></i>
                                        Back
                                    </button>
                                    <div className="text-center flex-1">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl mb-4 shadow-lg">
                                            <i className="fas fa-check text-white text-2xl"></i>
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Records</h2>
                                        <p className="text-gray-600">
                                            Found <strong>{parsedRecords.length}</strong> service record{parsedRecords.length !== 1 ? 's' : ''} to import
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 rounded-2xl mb-6 overflow-hidden">
                                    <div className="max-h-80 overflow-y-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-emerald-600 text-white sticky top-0 z-30">
                                                <tr>
                                                    <th className="px-3 py-3 text-left font-semibold text-xs">FROM</th>
                                                    <th className="px-3 py-3 text-left font-semibold text-xs">TO</th>
                                                    <th className="px-3 py-3 text-left font-semibold text-xs">DESIGNATION</th>
                                                    <th className="px-3 py-3 text-left font-semibold text-xs">STATUS</th>
                                                    <th className="px-3 py-3 text-left font-semibold text-xs">SALARY</th>
                                                    <th className="px-3 py-3 text-left font-semibold text-xs">STATION</th>
                                                    <th className="px-3 py-3 text-left font-semibold text-xs">SEP. DATE</th>
                                                    <th className="px-3 py-3 text-left font-semibold text-xs">SEP. CAUSE</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {[...parsedRecords].sort((a, b) => new Date(b.date_from) - new Date(a.date_from)).map((record, index) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-3 py-3 text-sm text-gray-900">{formatDate(record.date_from)}</td>
                                                        <td className="px-3 py-3 text-sm text-gray-900">{record.date_to ? formatDate(record.date_to) : 'Present'}</td>
                                                        <td className="px-3 py-3 text-sm text-gray-900">{record.designation || '-'}</td>
                                                        <td className="px-3 py-3 text-sm text-gray-900">{record.status || '-'}</td>
                                                        <td className="px-3 py-3 text-sm text-gray-900">{record.salary ? record.salary.toLocaleString() : '-'}</td>
                                                        <td className="px-3 py-3 text-sm text-gray-900">{record.station || '-'}</td>
                                                        <td className="px-3 py-3 text-sm text-gray-900">{record.separation_date ? formatDate(record.separation_date) : '-'}</td>
                                                        <td className="px-3 py-3 text-sm text-gray-900">{record.separation_cause || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between pt-4 border-t border-gray-200/50">
                                    <button
                                        type="button"
                                        onClick={closeImportModal}
                                        className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={handleConfirmImport}
                                            disabled={importing}
                                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                                        >
                                            {importing ? (
                                                <span className="flex items-center gap-2">
                                                    <i className="fas fa-spinner fa-spin"></i>
                                                    Importing...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <i className="fas fa-check"></i>
                                                    Confirm Import
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

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
