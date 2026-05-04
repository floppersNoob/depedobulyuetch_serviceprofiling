import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Alert from '../components/Alert.jsx';

const EmploymentStatusList = () => {
    const [statuses, setStatuses] = useState([]);
    const [newStatus, setNewStatus] = useState('');
    const [editingStatus, setEditingStatus] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchStatuses();
    }, []);

    const fetchStatuses = async () => {
        try {
            const response = await axios.get('/api/employment-status');
            setStatuses(response.data || []);
        } catch (error) {
            setAlert({ message: 'Failed to load employment statuses', type: 'error' });
        }
        setLoading(false);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newStatus.trim()) return;

        try {
            await axios.post('/api/employment-status', { status_name: newStatus });
            setNewStatus('');
            setAlert({ message: 'Employment status added successfully', type: 'success' });
            fetchStatuses();
        } catch (error) {
            setAlert({ message: 'Failed to add employment status', type: 'error' });
        }
    };

    const handleEdit = (status) => {
        setEditingStatus(status.status_id);
        setEditValue(status.status_name);
    };

    const handleUpdate = async (id) => {
        try {
            await axios.put(`/api/employment-status/${id}`, { status_name: editValue });
            setEditingStatus(null);
            setAlert({ message: 'Employment status updated successfully', type: 'success' });
            fetchStatuses();
        } catch (error) {
            setAlert({ message: 'Failed to update employment status', type: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this employment status?')) return;

        try {
            await axios.delete(`/api/employment-status/${id}`);
            setAlert({ message: 'Employment status deleted successfully', type: 'success' });
            fetchStatuses();
        } catch (error) {
            setAlert({ message: 'Failed to delete employment status', type: 'error' });
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50/80 to-white">
            <div className="text-center">
                <div className="w-12 h-12 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-sm border border-gray-200/50">
                    <i className="fas fa-spinner fa-spin text-[#007aff] text-xl"></i>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50/80 to-white p-6">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-sm p-6">
                    <Alert message={alert?.message} type={alert?.type} onClose={() => setAlert(null)} />

                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-6">Employment Statuses</h1>

                    <form onSubmit={handleAdd} className="mb-6 flex gap-2">
                        <input
                            type="text"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            placeholder="Enter status name (e.g., Permanent, Temporary)..."
                            className="flex-1 bg-white border border-gray-200/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
                        />
                        <button type="submit" className="bg-[#007aff] text-white px-4 py-2.5 rounded-xl hover:bg-[#0056b3] transition-all text-sm font-semibold shadow-sm">
                            Add
                        </button>
                    </form>

                    <div className="rounded-xl overflow-hidden border border-gray-200/60">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/80">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status Name</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {!statuses || statuses.length === 0 ? (
                                    <tr>
                                        <td colSpan="2" className="px-4 py-8 text-center text-gray-400 text-sm">No employment statuses found.</td>
                                    </tr>
                                ) : (
                                    statuses.map((status) => (
                                        <tr key={status.status_id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {editingStatus === status.status_id ? (
                                                    <input
                                                        type="text"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="bg-white border border-gray-200/80 rounded-xl px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span className="font-medium text-gray-900">{status.status_name}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right">
                                                {editingStatus === status.status_id ? (
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => handleUpdate(status.status_id)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#34c759]/10 text-[#34c759] hover:bg-[#34c759]/20 transition-all"
                                                            title="Save"
                                                        >
                                                            <i className="fas fa-check text-xs"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingStatus(null)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
                                                            title="Cancel"
                                                        >
                                                            <i className="fas fa-times text-xs"></i>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => handleEdit(status)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#007aff]/10 text-[#007aff] hover:bg-[#007aff]/20 transition-all"
                                                            title="Edit"
                                                        >
                                                            <i className="fas fa-pencil-alt text-xs"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(status.status_id)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#ff3b30]/10 text-[#ff3b30] hover:bg-[#ff3b30]/20 transition-all"
                                                            title="Delete"
                                                        >
                                                            <i className="fas fa-trash text-xs"></i>
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmploymentStatusList;
