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

    if (loading) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto">
            <Alert message={alert?.message} type={alert?.type} onClose={() => setAlert(null)} />

            <h1 className="text-2xl font-bold text-gray-800 mb-6">Employment Statuses</h1>

            <form onSubmit={handleAdd} className="mb-6 flex space-x-2">
                <input
                    type="text"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    placeholder="Enter status name (e.g., Permanent, Temporary)..."
                    className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Add Status
                </button>
            </form>

            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {!statuses || statuses.length === 0 ? (
                        <tr>
                            <td colSpan="2" className="px-6 py-4 text-center text-gray-500">No employment statuses found.</td>
                        </tr>
                    ) : (
                        statuses.map((status) => (
                            <tr key={status.status_id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {editingStatus === status.status_id ? (
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="border border-gray-300 rounded px-2 py-1 w-full"
                                            autoFocus
                                        />
                                    ) : (
                                        <span className="font-medium text-gray-900">{status.status_name}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    {editingStatus === status.status_id ? (
                                        <>
                                            <button
                                                onClick={() => handleUpdate(status.status_id)}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingStatus(null)}
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleEdit(status)}
                                                className="text-yellow-600 hover:text-yellow-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(status.status_id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default EmploymentStatusList;
