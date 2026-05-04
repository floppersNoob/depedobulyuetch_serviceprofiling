import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Alert from '../components/Alert.jsx';
import Swal from 'sweetalert2';

// Helper to format date to YYYY-MM-DD for date inputs
const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
};

const ServiceRecordForm = ({ isOpen, onClose, serviceRecordId: propServiceRecordId, employeeId: propEmployeeId }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isEdit = Boolean(id || propServiceRecordId);
    // Prioritize prop over URL parameter when in modal mode (when isOpen is defined)
    const serviceRecordId = isOpen !== undefined ? propServiceRecordId : (id || propServiceRecordId);
    const preselectedEmployee = propEmployeeId || searchParams.get('employee_id');

    // Main service record data
    const [formData, setFormData] = useState({
        employee_id: preselectedEmployee || '',
        position_id: '',
        status_id: '',
        office_id: '',
        station_place: '',
        branch: '',
        date_from: '',
        date_to: '',
        remarks: ''
    });

    // Salary - amount and unit only, no calculations
    const [salaryAmount, setSalaryAmount] = useState('');
    const [rateUnit, setRateUnit] = useState('daily'); // daily, monthly, annually

    // Leave and Separation
    const [leaveData, setLeaveData] = useState({ leave_type: '', date_from: '', date_to: '' });
    const [separationData, setSeparationData] = useState({ separation_date: '', cause: '' });

    // Dropdowns
    const [employees, setEmployees] = useState([]);
    const [positions, setPositions] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [offices, setOffices] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState(null);

    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchDropdownData();
        if (isEdit) {
            // Reset form data before fetching new record
            setFormData({
                employee_id: '',
                position_id: '',
                status_id: '',
                office_id: '',
                station_place: '',
                branch: '',
                date_from: '',
                date_to: '',
                remarks: ''
            });
            setSalaryAmount('');
            setLeaveData({ leave_type: '', date_from: '', date_to: '' });
            setSeparationData({ separation_date: '', cause: '' });
            setSelectedStatus(null);
            setLoading(true);
            fetchServiceRecord();
        } else {
            // Reset form data when in add mode
            setFormData({
                employee_id: preselectedEmployee || '',
                position_id: '',
                status_id: '',
                office_id: '',
                station_place: '',
                branch: '',
                date_from: '',
                date_to: '',
                remarks: ''
            });
            setSalaryAmount('');
            setLeaveData({ leave_type: '', date_from: '', date_to: '' });
            setSeparationData({ separation_date: '', cause: '' });
            setSelectedStatus(null);
        }
    }, [serviceRecordId, propEmployeeId]);

    // Removed calculation logic - just store amount and unit as-is

    const fetchDropdownData = async () => {
        try {
            const [empRes, posRes, statRes, offRes] = await Promise.all([
                axios.get('/api/employees?per_page=1000'),
                axios.get('/api/positions'),
                axios.get('/api/employment-status'),
                axios.get('/api/offices')
            ]);
            setEmployees(empRes.data.data || []);
            setPositions(posRes.data || []);
            setStatuses(statRes.data || []);
            setOffices(offRes.data || []);
        } catch (error) {
        }
    };

    const fetchServiceRecord = async () => {
        try {
            const response = await axios.get(`/api/service-records/${serviceRecordId}`);
            const record = response.data;
            setFormData({
                employee_id: record.employee_id,
                position_id: record.position?.position_name || '',
                status_id: record.status_id,
                office_id: record.office_id,
                station_place: record.office?.station_place || record.office?.department || '',
                branch: record.office?.branch || '',
                date_from: formatDateForInput(record.date_from),
                date_to: formatDateForInput(record.date_to),
                remarks: record.remarks || ''
            });
            // Load existing salary if any
            if (record.salary_histories && record.salary_histories.length > 0) {
                const latestSalary = record.salary_histories[0];
                setRateUnit(latestSalary.rate_unit || 'daily');
                setSalaryAmount(latestSalary.amount);
            }
            // Load leave if any
            if (record.leave_records && record.leave_records.length > 0) {
                const leave = record.leave_records[0];
                setLeaveData({
                    leave_type: leave.leave_type,
                    date_from: formatDateForInput(leave.date_from),
                    date_to: formatDateForInput(leave.date_to)
                });
            }
            // Load separation if any
            if (record.separation_record) {
                setSeparationData({
                    separation_date: formatDateForInput(record.separation_record.separation_date),
                    cause: record.separation_record.cause
                });
            }
        } catch (error) {
            setAlert({ message: 'Failed to load service record', type: 'error' });
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: null });

        // Track selected status for salary display
        if (e.target.name === 'status_id') {
            const status = statuses.find(s => s.status_id == e.target.value);
            setSelectedStatus(status);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);

        try {
            let recordId = serviceRecordId;

            // Prepare data: convert empty date_to to null for backend validation
            const submitData = {
                ...formData,
                date_to: formData.date_to || null
            };

            // Create/update service record
            if (isEdit) {
                await axios.put(`/api/service-records/${serviceRecordId}`, submitData);
            } else {
                const response = await axios.post('/api/service-records', submitData);
                recordId = response.data.service_id;
            }

            // Save salary history
            const status = statuses.find(s => s.status_id == formData.status_id);
            const isCasual = status?.status_name?.toLowerCase() === 'casual';

            if (salaryAmount) {
                const salaryData = {
                    service_id: recordId,
                    amount: salaryAmount,
                    rate_unit: isCasual ? 'daily' : rateUnit,
                    effective_date: formData.date_from
                };
                await axios.post('/api/salary-history', salaryData);
            }

            // Handle leave record - create, update, or delete
            if (isEdit) {
                // Get existing leave records
                const existingLeave = await axios.get(`/api/service-records/${recordId}`);
                const leaveRecords = existingLeave.data.leave_records || [];

                if (leaveData.leave_type && leaveData.date_from) {
                    // Normalize leave data: convert empty date_to to null
                    const leaveSubmitData = {
                        ...leaveData,
                        date_to: leaveData.date_to || null
                    };
                    // Update or create leave record
                    if (leaveRecords.length > 0) {
                        await axios.put(`/api/leave-records/${leaveRecords[0].leave_id}`, {
                            service_id: recordId,
                            ...leaveSubmitData
                        });
                    } else {
                        await axios.post('/api/leave-records', {
                            service_id: recordId,
                            ...leaveSubmitData
                        });
                    }
                } else if (leaveRecords.length > 0) {
                    // Delete existing leave records if fields are cleared
                    await axios.delete(`/api/leave-records/${leaveRecords[0].leave_id}`);
                }
            } else {
                // Create new leave record if provided
                if (leaveData.leave_type && leaveData.date_from) {
                    const leaveSubmitData = {
                        ...leaveData,
                        date_to: leaveData.date_to || null
                    };
                    await axios.post('/api/leave-records', {
                        service_id: recordId,
                        ...leaveSubmitData
                    });
                }
            }

            // Handle separation record - create, update, or delete
            if (isEdit) {
                const existingRecord = await axios.get(`/api/service-records/${recordId}`);
                const separationRecord = existingRecord.data.separation_record;

                if (separationData.separation_date || separationData.cause) {
                    // Update or create separation record
                    if (separationRecord) {
                        await axios.put(`/api/separation-records/${separationRecord.separation_id}`, {
                            service_id: recordId,
                            ...separationData
                        });
                    } else {
                        await axios.post('/api/separation-records', {
                            service_id: recordId,
                            ...separationData
                        });
                    }
                } else if (separationRecord) {
                    // Delete existing separation record if fields are cleared
                    await axios.delete(`/api/separation-records/${separationRecord.separation_id}`);
                }
            } else {
                // Create new separation record if provided
                if (separationData.separation_date || separationData.cause) {
                    await axios.post('/api/separation-records', {
                        service_id: recordId,
                        ...separationData
                    });
                }
            }

            // Show success alert
            Swal.fire({
                icon: false,
                title: false,
                html: `
                    <div class="flex items-center gap-3">
                        <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <div class="font-semibold text-gray-900">${isEdit ? 'Updated' : 'Created'}!</div>
                            <div class="text-sm text-gray-600">Service record ${isEdit ? 'updated' : 'created'} successfully</div>
                        </div>
                    </div>
                `,
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
                position: 'top-end',
                toast: true,
                width: '320px',
                padding: '16px',
                background: '#ffffff',
                customClass: {
                    popup: 'ios-toast',
                    container: 'ios-toast-container'
                },
                showClass: {
                    popup: 'animate__animated animate__slideInRight'
                },
                hideClass: {
                    popup: 'animate__animated animate__slideOutRight'
                }
            });

            // Navigate or close modal
            if (onClose) {
                onClose();
            } else {
                navigate(`/employees/${formData.employee_id}`);
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setAlert({ message: `Failed to ${isEdit ? 'update' : 'create'} service record`, type: 'error' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const isCasual = selectedStatus?.status_name?.toLowerCase() === 'casual';

    if (loading) return <div className="text-center py-8">Loading...</div>;

    const formContent = (
        <>
            <Alert message={alert?.message} type={alert?.type} onClose={() => setAlert(null)} />
            
            <div className="flex justify-between items-center p-6 border-b border-gray-200/50">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl w-10 h-10 flex items-center justify-center shadow-lg">
                        <i className="fas fa-edit"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-dpwh-blue">
                            {isEdit ? 'Edit Service Record' : 'Add Service Record'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {isEdit ? 'Update existing service record information' : 'Add new service record information'}
                        </p>
                    </div>
                </div>
                {isOpen && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* SERVICE SECTION */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Service</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-700">Date From *</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="date_from"
                                    value={formData.date_from}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 bg-white/50 hover:bg-white"
                                />
                                {errors.date_from && <p className="text-red-500 text-sm mt-1">{errors.date_from[0]}</p>}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-700">Date To (blank if current)</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="date_to"
                                    value={formData.date_to}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 bg-white/50 hover:bg-white"
                                />
                                {errors.date_to && <p className="text-red-500 text-sm mt-1">{errors.date_to[0]}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RECORD OF APPOINTMENT */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Record of Appointment</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
                            <select
                                name="employee_id"
                                value={formData.employee_id}
                                onChange={handleChange}
                                required
                                disabled={isEdit}
                                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                                <option value="">Select Employee</option>
                                {employees.map((emp) => (
                                    <option key={emp.employee_id} value={emp.employee_id}>
                                        {emp.surname}, {emp.given_name} {emp.middle_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Designation *
                                <span className="text-xs text-gray-500 font-normal ml-1">(type or select)</span>
                            </label>
                            <input
                                type="text"
                                name="position_id"
                                value={formData.position_id}
                                onChange={handleChange}
                                list="position-options"
                                required
                                placeholder="Type or select designation"
                                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <datalist id="position-options">
                                {positions.map((pos) => (
                                    <option key={pos.position_id} value={pos.position_name}>
                                        {pos.position_name}
                                    </option>
                                ))}
                            </datalist>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status * (Permanent/Casual)</label>
                            <select
                                name="status_id"
                                value={formData.status_id}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Status</option>
                                {statuses.map((stat) => (
                                    <option key={stat.status_id} value={stat.status_id}>
                                        {stat.status_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* SALARY SECTION */}
                        <div className="md:col-span-2 bg-gray-50 p-4 rounded">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Salary Amount (Php) *
                            </label>
                            <div className="flex items-center space-x-4">
                                <input
                                    type="number"
                                    value={salaryAmount}
                                    onChange={(e) => setSalaryAmount(e.target.value)}
                                    placeholder="Enter Salary"
                                    className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <select
                                    value={rateUnit}
                                    onChange={(e) => setRateUnit(e.target.value)}
                                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Rate Unit</option>
                                    <option value="daily">Daily</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="annually">Annually</option>
                                </select>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                {isCasual
                                    ? 'Casual: Salary recorded as daily rate (e.g., 500/d)'
                                    : 'Permanent: Salary recorded as-is with selected unit'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* OFFICE ENTITY */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Office Entity</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Station/Place of Assignment *
                                <span className="text-xs text-gray-500 font-normal ml-1">(type or select)</span>
                            </label>
                            <input
                                type="text"
                                name="station_place"
                                value={formData.station_place}
                                onChange={handleChange}
                                list="station-options"
                                required
                                placeholder="Type or select station/place"
                                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <datalist id="station-options">
                                {offices.map((off) => (
                                    <option key={off.office_id} value={off.station_place || off.department}>
                                        {off.station_place || off.department}{off.branch ? ` - ${off.branch}` : ''}
                                    </option>
                                ))}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Branch
                                <span className="text-xs text-gray-500 font-normal ml-1">(type or select)</span>
                            </label>
                            <input
                                type="text"
                                name="branch"
                                value={formData.branch}
                                onChange={handleChange}
                                list="branch-options"
                                placeholder="Type or select branch"
                                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <datalist id="branch-options">
                                {offices.map((off) => (
                                    <option key={`branch-${off.office_id}`} value={off.branch || ''}>
                                        {off.branch}
                                    </option>
                                ))}
                            </datalist>
                        </div>
                    </div>
                </div>

                {/* LEAVE ABSENCE W/O PAY */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Leave of Absence w/o Pay (Optional)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            placeholder="Leave Type"
                            value={leaveData.leave_type}
                            onChange={(e) => setLeaveData({ ...leaveData, leave_type: e.target.value })}
                            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="date"
                            placeholder="From"
                            value={leaveData.date_from}
                            onChange={(e) => setLeaveData({ ...leaveData, date_from: e.target.value })}
                            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="date"
                            placeholder="To"
                            value={leaveData.date_to}
                            onChange={(e) => setLeaveData({ ...leaveData, date_to: e.target.value })}
                            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* SEPARATION (Optional) */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Separation (Optional)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                value={separationData.separation_date}
                                onChange={(e) => setSeparationData({ ...separationData, separation_date: e.target.value })}
                                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cause</label>
                            <input
                                type="text"
                                value={separationData.cause}
                                onChange={(e) => setSeparationData({ ...separationData, cause: e.target.value })}
                                placeholder="e.g., Retirement, Resignation, End of Contract"
                                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* REMARKS (Optional) */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Remarks (Optional)</h2>
                    <div>
                        <input
                            type="text"
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            placeholder="e.g., NOSI SG 5-2"
                            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex justify-between">
                    <button
                        type="button"
                        onClick={() => onClose ? onClose() : navigate(formData.employee_id ? `/employees/${formData.employee_id}` : '/employees')}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className={`bg-blue-600 text-white px-4 py-2 rounded transition-all duration-300 transform ${
                            submitting 
                                ? 'bg-blue-400 cursor-not-allowed scale-95' 
                                : 'hover:bg-blue-700 hover:scale-105 active:scale-95'
                        }`}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {isEdit ? 'Updating...' : 'Saving...'}
                            </span>
                        ) : (
                            <span>
                                {isEdit ? 'Update Service Record' : 'Save Service Record'}
                            </span>
                        )}
                    </button>
                </div>
            </form>
        </>
    );

    // Render as modal or page
    if (isOpen !== undefined) {
        // Modal mode
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
                <div
                    className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
                    onClick={onClose}
                ></div>
                <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full z-10 max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100 border border-gray-200/50">
                    {formContent}
                </div>
            </div>
        );
    }

    // Page mode (backward compatibility)
    return (
        <div className="bg-white shadow rounded-lg p-6 max-w-4xl mx-auto">
            {formContent}
        </div>
    );
};

export default ServiceRecordForm;
