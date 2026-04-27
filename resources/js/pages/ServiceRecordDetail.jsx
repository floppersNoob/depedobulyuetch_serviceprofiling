import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Alert from '../components/Alert.jsx';

const ServiceRecordDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [activeTab, setActiveTab] = useState('salary');

    // Form states for nested resources
    const [salaryForm, setSalaryForm] = useState({ amount: '', rate_unit: 'annual', effective_date: '' });
    const [leaveForm, setLeaveForm] = useState({ leave_type: '', date_from: '', date_to: '' });
    const [separationForm, setSeparationForm] = useState({ separation_date: '', cause: '' });

    useEffect(() => {
        fetchRecord();
    }, [id]);

    const fetchRecord = async () => {
        try {
            const response = await axios.get(`/api/service-records/${id}`);
            setRecord(response.data);
        } catch (error) {
            setAlert({ message: 'Failed to load service record', type: 'error' });
        }
        setLoading(false);
    };

    const handleAddSalary = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/salary-history', { ...salaryForm, service_id: id });
            setSalaryForm({ amount: '', rate_unit: 'annual', effective_date: '' });
            setAlert({ message: 'Salary added successfully', type: 'success' });
            fetchRecord();
        } catch (error) {
            setAlert({ message: 'Failed to add salary', type: 'error' });
        }
    };

    const handleAddLeave = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/leave-records', { ...leaveForm, service_id: id });
            setLeaveForm({ leave_type: '', date_from: '', date_to: '' });
            setAlert({ message: 'Leave record added successfully', type: 'success' });
            fetchRecord();
        } catch (error) {
            setAlert({ message: 'Failed to add leave record', type: 'error' });
        }
    };

    const handleAddSeparation = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/separation-records', { ...separationForm, service_id: id });
            setSeparationForm({ separation_date: '', cause: '' });
            setAlert({ message: 'Separation record added successfully', type: 'success' });
            fetchRecord();
        } catch (error) {
            setAlert({ message: 'Failed to add separation record', type: 'error' });
        }
    };

    const handleDeleteSalary = async (salaryId) => {
        if (!confirm('Delete this salary record?')) return;
        try {
            await axios.delete(`/api/salary-history/${salaryId}`);
            fetchRecord();
        } catch (error) {
            setAlert({ message: 'Failed to delete salary', type: 'error' });
        }
    };

    const handleDeleteLeave = async (leaveId) => {
        if (!confirm('Delete this leave record?')) return;
        try {
            await axios.delete(`/api/leave-records/${leaveId}`);
            fetchRecord();
        } catch (error) {
            setAlert({ message: 'Failed to delete leave record', type: 'error' });
        }
    };

    const handleDeleteSeparation = async () => {
        if (!confirm('Delete this separation record?')) return;
        try {
            await axios.delete(`/api/separation-records/${record.separation_record.separation_id}`);
            fetchRecord();
        } catch (error) {
            setAlert({ message: 'Failed to delete separation record', type: 'error' });
        }
    };

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (!record) return <div className="text-center py-8">Service record not found</div>;

    return (
        <div className="space-y-6">
            <Alert message={alert?.message} type={alert?.type} onClose={() => setAlert(null)} />

            {/* Header */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Service Record Details</h1>
                        <p className="text-gray-600 mt-1">
                            <Link to={`/employees/${record.employee_id}`} className="text-blue-600 hover:underline">
                                {record.employee?.surname}, {record.employee?.given_name}
                            </Link>
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Link
                            to={`/service-records/${id}/edit`}
                            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm"
                        >
                            Edit
                        </Link>
                        <button
                            onClick={() => navigate(`/employees/${record.employee_id}`)}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
                        >
                            Back
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase">Period</h3>
                        <p className="text-lg">
                            {new Date(record.date_from).toLocaleDateString()}
                            {record.date_to ? ` - ${new Date(record.date_to).toLocaleDateString()}` : ' - Present'}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase">Designation</h3>
                        <p className="text-lg">{record.position?.position_name || '-'}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase">Status</h3>
                        <p className="text-lg">{record.employment_status?.status_name || '-'}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase">Office</h3>
                        <p className="text-lg">{record.office?.department || '-'}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase">Branch</h3>
                        <p className="text-lg">{record.office?.branch || '-'}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase">Leave w/o Pay</h3>
                        <p className="text-lg">
                            {record.leave_records && record.leave_records.length > 0 ? record.leave_records[0].leave_type : '-'}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase">Separation Date</h3>
                        <p className="text-lg">
                            {record.separation_record?.separation_date ? new Date(record.separation_record.separation_date).toLocaleDateString() : '-'}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase">Separation Cause</h3>
                        <p className="text-lg">{record.separation_record?.cause || '-'}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white shadow rounded-lg">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        {['salary', 'leave', 'separation'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-6 font-medium text-sm capitalize ${
                                    activeTab === tab
                                        ? 'border-b-2 border-blue-500 text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {tab} Records
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Salary Tab */}
                    {activeTab === 'salary' && (
                        <div className="space-y-4">
                            <form onSubmit={handleAddSalary} className="flex space-x-2 mb-4">
                                <input
                                    type="number"
                                    placeholder="Amount"
                                    value={salaryForm.amount}
                                    onChange={(e) => setSalaryForm({ ...salaryForm, amount: e.target.value })}
                                    className="border border-gray-300 rounded px-3 py-2"
                                    required
                                />
                                <select
                                    value={salaryForm.rate_unit}
                                    onChange={(e) => setSalaryForm({ ...salaryForm, rate_unit: e.target.value })}
                                    className="border border-gray-300 rounded px-3 py-2"
                                >
                                    <option value="annual">Annual</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="daily">Daily</option>
                                </select>
                                <input
                                    type="date"
                                    value={salaryForm.effective_date}
                                    onChange={(e) => setSalaryForm({ ...salaryForm, effective_date: e.target.value })}
                                    className="border border-gray-300 rounded px-3 py-2"
                                    required
                                />
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                    Add Salary
                                </button>
                            </form>

                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate Unit</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effective Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {!record.salary_histories?.length ? (
                                        <tr><td colSpan="4" className="px-4 py-4 text-center text-gray-500">No salary records</td></tr>
                                    ) : (
                                        record.salary_histories.map((s) => (
                                            <tr key={s.salary_id}>
                                                <td className="px-4 py-3">{parseFloat(s.amount).toLocaleString()}</td>
                                                <td className="px-4 py-3 capitalize">{s.rate_unit}</td>
                                                <td className="px-4 py-3">{new Date(s.effective_date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3">
                                                    <button onClick={() => handleDeleteSalary(s.salary_id)} className="text-red-600 hover:text-red-900">Delete</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Leave Tab */}
                    {activeTab === 'leave' && (
                        <div className="space-y-4">
                            <form onSubmit={handleAddLeave} className="flex space-x-2 mb-4">
                                <input
                                    type="text"
                                    placeholder="Leave Type"
                                    value={leaveForm.leave_type}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                                    className="border border-gray-300 rounded px-3 py-2"
                                    required
                                />
                                <input
                                    type="date"
                                    value={leaveForm.date_from}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, date_from: e.target.value })}
                                    className="border border-gray-300 rounded px-3 py-2"
                                    required
                                />
                                <input
                                    type="date"
                                    value={leaveForm.date_to}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, date_to: e.target.value })}
                                    className="border border-gray-300 rounded px-3 py-2"
                                />
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                    Add Leave
                                </button>
                            </form>

                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {!record.leave_records?.length ? (
                                        <tr><td colSpan="4" className="px-4 py-4 text-center text-gray-500">No leave records</td></tr>
                                    ) : (
                                        record.leave_records.map((l) => (
                                            <tr key={l.leave_id}>
                                                <td className="px-4 py-3">{l.leave_type}</td>
                                                <td className="px-4 py-3">{new Date(l.date_from).toLocaleDateString()}</td>
                                                <td className="px-4 py-3">{l.date_to ? new Date(l.date_to).toLocaleDateString() : 'Present'}</td>
                                                <td className="px-4 py-3">
                                                    <button onClick={() => handleDeleteLeave(l.leave_id)} className="text-red-600 hover:text-red-900">Delete</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Separation Tab */}
                    {activeTab === 'separation' && (
                        <div className="space-y-4">
                            {!record.separation_record ? (
                                <form onSubmit={handleAddSeparation} className="flex space-x-2">
                                    <input
                                        type="date"
                                        value={separationForm.separation_date}
                                        onChange={(e) => setSeparationForm({ ...separationForm, separation_date: e.target.value })}
                                        className="border border-gray-300 rounded px-3 py-2"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Cause"
                                        value={separationForm.cause}
                                        onChange={(e) => setSeparationForm({ ...separationForm, cause: e.target.value })}
                                        className="border border-gray-300 rounded px-3 py-2 flex-1"
                                        required
                                    />
                                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                        Add Separation
                                    </button>
                                </form>
                            ) : (
                                <div className="bg-red-50 border border-red-200 rounded p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium text-red-800">Separation Record</h4>
                                            <p className="text-red-700 mt-1">
                                                Date: {new Date(record.separation_record.separation_date).toLocaleDateString()}
                                            </p>
                                            <p className="text-red-700">Cause: {record.separation_record.cause}</p>
                                        </div>
                                        <button
                                            onClick={handleDeleteSeparation}
                                            className="text-red-600 hover:text-red-900 font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceRecordDetail;
