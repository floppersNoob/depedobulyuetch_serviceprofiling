import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Alert from '../components/Alert.jsx';

const ServiceRecordAddForm = ({ isOpen, onClose, employeeId }) => {
    // Main service record data
    const [formData, setFormData] = useState({
        employee_id: employeeId || '',
        position_id: '',
        status_id: '',
        station_place: '',
        branch: '',
        date_from: '',
        date_to: ''
    });

    // Salary - amount and unit only, no calculations
    const [salaryAmount, setSalaryAmount] = useState('');
    const [rateUnit, setRateUnit] = useState('daily'); // daily, monthly, annually

    // Leave and Separation
    const [leaveData, setLeaveData] = useState({ leave_type: '', date_from: '', date_to: '' });
    const [separationData, setSeparationData] = useState({ separation_date: '', cause: '' });

    // Dropdowns
    const [positions, setPositions] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [offices, setOffices] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState(null);

    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchDropdownData();
    }, []);

    // Removed calculation logic - just store amount and unit as-is

    const fetchDropdownData = async () => {
        try {
            const [posRes, statRes, offRes] = await Promise.all([
                axios.get('/api/positions'),
                axios.get('/api/employment-status'),
                axios.get('/api/offices')
            ]);
            setPositions(posRes.data || []);
            setStatuses(statRes.data || []);
            setOffices(offRes.data || []);
        } catch (error) {
            console.error('Failed to load dropdown data', error);
        }
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
            // Prepare data: convert empty date_to to null for backend validation
            const submitData = {
                ...formData,
                date_to: formData.date_to || null
            };

            // Create service record
            const response = await axios.post('/api/service-records', submitData);
            const serviceRecordId = response.data.service_id;

            // Save salary history
            const status = statuses.find(s => s.status_id == formData.status_id);
            const isCasual = status?.status_name?.toLowerCase() === 'casual';

            if (salaryAmount) {
                const salaryData = {
                    service_id: serviceRecordId,
                    amount: salaryAmount,
                    rate_unit: isCasual ? 'daily' : rateUnit,
                    effective_date: formData.date_from
                };
                await axios.post('/api/salary-history', salaryData);
            }

            // Create leave record if provided
            if (leaveData.leave_type && leaveData.date_from) {
                const leaveSubmitData = {
                    ...leaveData,
                    date_to: leaveData.date_to || null
                };
                await axios.post('/api/leave-records', {
                    service_id: serviceRecordId,
                    ...leaveSubmitData
                });
            }

            // Create separation record if provided
            if (separationData.separation_date || separationData.cause) {
                await axios.post('/api/separation-records', {
                    service_id: serviceRecordId,
                    ...separationData
                });
            }

            onClose();
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setAlert({ message: 'Failed to create service record', type: 'error' });
            }
        }
    };

    const isCasual = selectedStatus?.status_name?.toLowerCase() === 'casual';

    if (!isOpen) return null;

    const formContent = (
        <>
            <Alert message={alert?.message} type={alert?.type} onClose={() => setAlert(null)} />

            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Add Service Record
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

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Save Service Record
                    </button>
                </div>
            </form>
        </>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
            <div
                className="absolute inset-0 bg-gray-300/25 backdrop-blur-sm"
                onClick={onClose}
            ></div>
            <div className="relative bg-white rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.3)] max-w-4xl w-full z-10 max-h-[90vh] overflow-y-auto p-6">
                {formContent}
            </div>
        </div>
    );
};

export default ServiceRecordAddForm;
