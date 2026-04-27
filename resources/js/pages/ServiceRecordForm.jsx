import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Alert from '../components/Alert.jsx';

const WORKING_DAYS_PER_YEAR = 243;

const ServiceRecordForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isEdit = Boolean(id);
    const preselectedEmployee = searchParams.get('employee_id');

    // Main service record data
    const [formData, setFormData] = useState({
        employee_id: preselectedEmployee || '',
        position_id: '',
        status_id: '',
        office_id: '',
        station_place: '',
        branch: '',
        date_from: '',
        date_to: ''
    });

    // Salary calculation
    const [dailyRate, setDailyRate] = useState('');
    const [calculatedAnnual, setCalculatedAnnual] = useState(0);

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
    const [alert, setAlert] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchDropdownData();
        if (isEdit) {
            fetchServiceRecord();
        }
    }, [id]);

    useEffect(() => {
        // Calculate annual salary when daily rate changes
        const rate = parseFloat(dailyRate) || 0;
        setCalculatedAnnual(rate * WORKING_DAYS_PER_YEAR);
    }, [dailyRate]);

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
            console.error('Failed to load dropdown data', error);
        }
    };

    const fetchServiceRecord = async () => {
        try {
            const response = await axios.get(`/api/service-records/${id}`);
            const record = response.data;
            setFormData({
                employee_id: record.employee_id,
                position_id: record.position_id,
                status_id: record.status_id,
                office_id: record.office_id,
                station_place: record.office?.station_place || record.office?.department || '',
                branch: record.office?.branch || '',
                date_from: record.date_from,
                date_to: record.date_to || ''
            });
            // Load existing salary if any
            if (record.salary_histories && record.salary_histories.length > 0) {
                const latestSalary = record.salary_histories[0];
                if (latestSalary.rate_unit === 'daily') {
                    setDailyRate(latestSalary.amount);
                } else {
                    setDailyRate((latestSalary.amount / WORKING_DAYS_PER_YEAR).toFixed(2));
                }
            }
            // Load leave if any
            if (record.leave_records && record.leave_records.length > 0) {
                const leave = record.leave_records[0];
                setLeaveData({ leave_type: leave.leave_type, date_from: leave.date_from, date_to: leave.date_to || '' });
            }
            // Load separation if any
            if (record.separation_record) {
                setSeparationData({
                    separation_date: record.separation_record.separation_date,
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

        try {
            let serviceRecordId = id;

            // Create/update service record
            if (isEdit) {
                await axios.put(`/api/service-records/${id}`, formData);
            } else {
                const response = await axios.post('/api/service-records', formData);
                serviceRecordId = response.data.service_id;
            }

            // Save salary history
            const status = statuses.find(s => s.status_id == formData.status_id);
            const isCasual = status?.status_name?.toLowerCase() === 'casual';

            if (dailyRate) {
                const salaryData = {
                    service_id: serviceRecordId,
                    amount: isCasual ? dailyRate : calculatedAnnual,
                    rate_unit: isCasual ? 'daily' : 'annual',
                    effective_date: formData.date_from
                };
                await axios.post('/api/salary-history', salaryData);
            }

            // Save leave record if provided
            if (leaveData.leave_type && leaveData.date_from) {
                await axios.post('/api/leave-records', {
                    service_id: serviceRecordId,
                    ...leaveData
                });
            }

            // Save separation if provided
            if (separationData.separation_date && separationData.cause) {
                await axios.post('/api/separation-records', {
                    service_id: serviceRecordId,
                    ...separationData
                });
            }

            navigate(`/employees/${formData.employee_id}`);
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setAlert({ message: `Failed to ${isEdit ? 'update' : 'create'} service record`, type: 'error' });
            }
        }
    };

    const isCasual = selectedStatus?.status_name?.toLowerCase() === 'casual';

    if (loading) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6 max-w-4xl mx-auto">
            <Alert message={alert?.message} type={alert?.type} onClose={() => setAlert(null)} />

            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                {isEdit ? 'Edit Service Record' : 'Add Service Record'}
            </h1>

            <form onSubmit={handleSubmit}>
                {/* SERVICE SECTION */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Service</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date From *</label>
                            <input
                                type="date"
                                name="date_from"
                                value={formData.date_from}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date To (blank if current)</label>
                            <input
                                type="date"
                                name="date_to"
                                value={formData.date_to}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                            <select
                                name="position_id"
                                value={formData.position_id}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Designation</option>
                                {positions.map((pos) => (
                                    <option key={pos.position_id} value={pos.position_id}>
                                        {pos.position_name}
                                    </option>
                                ))}
                            </select>
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
                                Daily Rate (Php) *
                            </label>
                            <div className="flex items-center space-x-4">
                                <input
                                    type="number"
                                    value={dailyRate}
                                    onChange={(e) => setDailyRate(e.target.value)}
                                    placeholder="Enter daily rate"
                                    className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <span className="text-gray-600">× {WORKING_DAYS_PER_YEAR} days =</span>
                                <div className="bg-white border border-gray-300 rounded px-4 py-2 min-w-[150px] text-center">
                                    {isCasual ? (
                                        <span className="font-medium">{dailyRate || 0}/d</span>
                                    ) : (
                                        <span className="font-medium">{calculatedAnnual.toLocaleString()}/an</span>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                {isCasual 
                                    ? 'Casual: Salary recorded as daily rate (e.g., 500/d)' 
                                    : 'Permanent: Daily rate × 243 working days = Annual salary'}
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

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate(formData.employee_id ? `/employees/${formData.employee_id}` : '/employees')}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        {isEdit ? 'Update Service Record' : 'Save Service Record'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ServiceRecordForm;
