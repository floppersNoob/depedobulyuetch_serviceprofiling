import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Alert from '../components/Alert.jsx';
import Swal from 'sweetalert2';

const ServiceRecordAddForm = ({ isOpen, onClose, employeeId }) => {
    // Main service record data
    const [formData, setFormData] = useState({
        employee_id: employeeId || '',
        position_id: '',
        status_id: '',
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
                            <div class="text-xl font-semibold text-gray-900">Service Record Added!</div>
                        </div>
                        <div class="text-sm text-gray-600 max-w-xs">
                            Service record has been successfully added to the system.
                        </div>
                        <div class="mt-4">
                            <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 rounded-full">
                                <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span class="text-xs font-semibold text-emerald-700">Record Created</span>
                            </div>
                        </div>
                    </div>
                `,
                confirmButtonColor: '#010066',
                confirmButtonText: 'Done',
                customClass: {
                    popup: 'ios-service-success',
                    container: 'ios-service-success-container'
                },
                showClass: {
                    popup: 'animate__animated animate__bounceIn'
                },
                hideClass: {
                    popup: 'animate__animated animate__bounceOut'
                }
            });

            // Clear all form fields after successful submission
            setFormData({
                employee_id: employeeId || '',
                position_id: '',
                status_id: '',
                station_place: '',
                branch: '',
                date_from: '',
                date_to: '',
                remarks: ''
            });
            setSalaryAmount('');
            setRateUnit('daily');
            setLeaveData({ leave_type: '', date_from: '', date_to: '' });
            setSeparationData({ separation_date: '', cause: '' });
            setSelectedStatus(null);
            setErrors({});
            setAlert(null);

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full z-10 max-h-[90vh] overflow-hidden flex flex-col border border-gray-200/50">
                <div className="flex justify-between items-center p-5 border-b border-gray-200/50 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-[#007aff] to-[#5856d6] text-white rounded-xl w-10 h-10 flex items-center justify-center shadow-md">
                            <i className="fas fa-plus text-sm"></i>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Add Service Record</h2>
                            <p className="text-xs text-gray-400">Create new service record</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100/80 hover:bg-gray-200/80 transition-colors text-gray-500"
                    >
                        <i className="fas fa-times text-sm"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1">
                    <Alert message={alert?.message} type={alert?.type} onClose={() => setAlert(null)} />
                    
                    {/* SERVICE SECTION */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Service</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Date From <span className="text-[#ff3b30]">*</span></label>
                                <input
                                    type="date"
                                    name="date_from"
                                    value={formData.date_from}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white border border-gray-200/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
                                />
                                {errors.date_from && <p className="text-[#ff3b30] text-xs mt-1">{errors.date_from[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Date To <span className="text-gray-400 text-xs">(leave blank if current)</span></label>
                                <input
                                    type="date"
                                    name="date_to"
                                    value={formData.date_to}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-gray-200/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
                                />
                                {errors.date_to && <p className="text-[#ff3b30] text-xs mt-1">{errors.date_to[0]}</p>}
                            </div>
                        </div>
                    </div>

                    {/* RECORD OF APPOINTMENT */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Record of Appointment</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Designation <span className="text-[#ff3b30]">*</span></label>
                                <input
                                    type="text"
                                    name="position_id"
                                    value={formData.position_id}
                                    onChange={handleChange}
                                    list="position-options"
                                    required
                                    placeholder="Type or select designation"
                                    className="w-full bg-white border border-gray-200/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
                                />
                                <datalist id="position-options">
                                    {positions.map((pos) => (
                                        <option key={pos.position_id} value={pos.position_name}>
                                            {pos.position_name}
                                        </option>
                                    ))}
                                </datalist>
                                {errors.position_id && <p className="text-[#ff3b30] text-xs mt-1">{errors.position_id[0]}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Status <span className="text-[#ff3b30]">*</span></label>
                                <select
                                    name="status_id"
                                    value={formData.status_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white border border-gray-200/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
                                >
                                    <option value="">Select Status</option>
                                    {statuses.map((stat) => (
                                        <option key={stat.status_id} value={stat.status_id}>
                                            {stat.status_name}
                                        </option>
                                    ))}
                                </select>
                                {errors.status_id && <p className="text-[#ff3b30] text-xs mt-1">{errors.status_id[0]}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Station/Place <span className="text-[#ff3b30]">*</span></label>
                                <input
                                    type="text"
                                    name="station_place"
                                    value={formData.station_place}
                                    onChange={handleChange}
                                    list="station-options"
                                    required
                                    placeholder="Type or select station/place"
                                    className="w-full bg-white border border-gray-200/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
                                />
                                <datalist id="station-options">
                                    {offices.map((off) => (
                                        <option key={`station-${off.office_id}`} value={off.station_place || ''}>
                                            {off.station_place}
                                        </option>
                                    ))}
                                </datalist>
                                {errors.station_place && <p className="text-[#ff3b30] text-xs mt-1">{errors.station_place[0]}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Branch</label>
                                <input
                                    type="text"
                                    name="branch"
                                    value={formData.branch}
                                    onChange={handleChange}
                                    list="branch-options"
                                    placeholder="Type or select branch"
                                    className="w-full bg-white border border-gray-200/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
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

                    {/* SALARY */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Salary <span className="text-gray-400 font-normal normal-case">(Optional)</span></h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/80 rounded-xl p-4 border border-gray-200/40">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Amount</label>
                                <input
                                    type="number"
                                    value={salaryAmount}
                                    onChange={(e) => setSalaryAmount(e.target.value)}
                                    placeholder="Enter salary amount"
                                    className="w-full bg-white border border-gray-200/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Rate Unit</label>
                                <select
                                    value={rateUnit}
                                    onChange={(e) => setRateUnit(e.target.value)}
                                    disabled={isCasual}
                                    className="w-full bg-white border border-gray-200/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all disabled:opacity-50"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="annually">Annually</option>
                                </select>
                                {isCasual && <p className="text-xs text-gray-400 mt-1">Casual employees are paid daily</p>}
                            </div>
                        </div>
                    </div>

                    {/* LEAVE ABSENCE W/O PAY */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Leave of Absence w/o Pay <span className="text-gray-400 font-normal normal-case">(Optional)</span></h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Leave Type"
                                    value={leaveData.leave_type}
                                    onChange={(e) => setLeaveData({ ...leaveData, leave_type: e.target.value })}
                                    className="w-full bg-white border border-gray-200/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
                                />
                            </div>
                            <div>
                                <input
                                    type="date"
                                    placeholder="From"
                                    value={leaveData.date_from}
                                    onChange={(e) => setLeaveData({ ...leaveData, date_from: e.target.value })}
                                    className="w-full bg-white border border-gray-200/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
                                />
                            </div>
                            <div>
                                <input
                                    type="date"
                                    placeholder="To"
                                    value={leaveData.date_to}
                                    onChange={(e) => setLeaveData({ ...leaveData, date_to: e.target.value })}
                                    className="w-full bg-white border border-gray-200/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SEPARATION (Optional) */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Separation <span className="text-gray-400 font-normal normal-case">(Optional)</span></h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Date</label>
                                <input
                                    type="date"
                                    value={separationData.separation_date}
                                    onChange={(e) => setSeparationData({ ...separationData, separation_date: e.target.value })}
                                    className="w-full bg-white border border-gray-200/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Cause</label>
                                <input
                                    type="text"
                                    value={separationData.cause}
                                    onChange={(e) => setSeparationData({ ...separationData, cause: e.target.value })}
                                    placeholder="e.g., Retirement, Resignation"
                                    className="w-full bg-white border border-gray-200/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* REMARKS (Optional) */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Remarks <span className="text-gray-400 font-normal normal-case">(Optional)</span></h3>
                        <div>
                            <input
                                type="text"
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                placeholder="e.g., NOSI SG 5-2"
                                className="w-full bg-white border border-gray-200/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between gap-3 pt-5 border-t border-gray-200/50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 bg-gray-100/80 text-gray-600 rounded-xl hover:bg-gray-200/80 transition-all text-sm font-semibold"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-5 py-2.5 bg-[#007aff] text-white rounded-xl hover:bg-[#0056b3] transition-all duration-200 text-sm font-semibold shadow-sm"
                        >
                            Save Service Record
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ServiceRecordAddForm;
