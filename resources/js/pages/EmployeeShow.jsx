import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Alert from '../components/Alert.jsx';

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

            setAlert({ message: response.data.message, type: 'success' });
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
        const formatted = amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return `${formatted}/${unit}`;
    };

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (!employee) return <div className="text-center py-8">Employee not found</div>;

    return (
        <div className="space-y-6">
            <Alert message={alert?.message} type={alert?.type} onClose={() => setAlert(null)} />

            {/* Employee Info */}
              <div className="flex justify-start">
                <Link to="/employees" className="text-blue-600 hover:text-blue-800">
                    &larr; Back to Employees
                </Link>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {employee.surname}, {employee.given_name} {employee.middle_name}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {employee.birth_date && `Born ${new Date(employee.birth_date).toLocaleDateString()}`}
                            {employee.birth_place && ` in ${employee.birth_place}`}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={handlePrintPdf}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                        >
                            Print PDF
                        </button>
                        <Link
                            to={`/employees/${id}/edit`}
                            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm"
                        >
                            Edit
                        </Link>
                    </div>
                </div>
            </div>

            {/* Service Records */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Service Records</h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={openImportModal}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Import Excel
                        </button>
                        <Link
                            to={`/service-records/create?employee_id=${id}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Add Service Record
                        </Link>
                    </div>
                </div>

                {!employee.service_records || employee.service_records.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        No service records found.{' '}
                        <Link to={`/service-records/create?employee_id=${id}`} className="text-blue-600 hover:underline">
                            Add one
                        </Link>
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period (mm/dd/yy)</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Office</th>
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
                                        <td className="px-4 py-3 text-sm">
                                            {record.office?.department || '-'}
                                            {record.office?.station_place && `, ${record.office.station_place}`}
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
                                            <Link
                                                to={`/service-records/${record.service_id}`}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Details
                                            </Link>
                                            <Link
                                                to={`/service-records/${record.service_id}/edit`}
                                                className="text-yellow-600 hover:text-yellow-900"
                                            >
                                                Edit
                                            </Link>
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
                )}
            </div>

            {/* Import Excel Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
                    <div
                        className="absolute inset-0 bg-gray-300/25 backdrop-blur-sm"
                        onClick={closeImportModal}
                    ></div>
                    <div className="relative bg-white rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.3)] max-w-6xl w-full z-10 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">
                                {showPreview ? 'Review Service Records' : 'Import Service Records'}
                            </h2>
                            <button
                                onClick={closeImportModal}
                                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6">
                            {!showPreview ? (
                                <>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Upload an Excel file with service record data. The Excel format should match the service record template.
                                    </p>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Excel File (.xlsx, .xls)</label>
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={handleFileChange}
                                            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={closeImportModal}
                                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleParseExcel}
                                            disabled={importing || !importFile}
                                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {importing ? 'Parsing...' : 'Parse Excel'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Found {parsedRecords.length} service record(s). Review the parsed data below before confirming the import.
                                    </p>
                                    <div className="mb-4 border border-gray-200 rounded">
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
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {parsedRecords.map((record, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                            {formatDate(record.date_from)}
                                                            {record.date_to && ` - ${formatDate(record.date_to)}`}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">{record.designation || '-'}</td>
                                                        <td className="px-4 py-3 text-sm">{record.status || '-'}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {formatSalary(record.salary, record.salary_unit)}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">{record.station || '-'}</td>
                                                        <td className="px-4 py-3 text-sm">{record.branch || '-'}</td>
                                                        <td className="px-4 py-3 text-sm">{record.leave || '-'}</td>
                                                        <td className="px-4 py-3 text-sm">{formatDate(record.separation_date)}</td>
                                                        <td className="px-4 py-3 text-sm">{record.separation_cause || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={handleBackToUpload}
                                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={closeImportModal}
                                            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleConfirmImport}
                                            disabled={importing}
                                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {importing ? 'Importing...' : 'Confirm Import'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeShow;
