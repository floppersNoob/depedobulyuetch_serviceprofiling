import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Alert from '../components/Alert.jsx';

const PositionList = () => {
    const [positions, setPositions] = useState([]);
    const [newPosition, setNewPosition] = useState('');
    const [editingPosition, setEditingPosition] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchPositions();
    }, []);

    const fetchPositions = async () => {
        try {
            const response = await axios.get('/api/positions');
            setPositions(response.data || []);
        } catch (error) {
            setAlert({ message: 'Failed to load designations', type: 'error' });
        }
        setLoading(false);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newPosition.trim()) return;

        try {
            await axios.post('/api/positions', { position_name: newPosition });
            setNewPosition('');
            setAlert({ message: 'Designation added successfully', type: 'success' });
            fetchPositions();
        } catch (error) {
            setAlert({ message: 'Failed to add designation', type: 'error' });
        }
    };

    const handleEdit = (position) => {
        setEditingPosition(position.position_id);
        setEditValue(position.position_name);
    };

    const handleUpdate = async (id) => {
        try {
            await axios.put(`/api/positions/${id}`, { position_name: editValue });
            setEditingPosition(null);
            setAlert({ message: 'Designation updated successfully', type: 'success' });
            fetchPositions();
        } catch (error) {
            setAlert({ message: 'Failed to update designation', type: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this designation?')) return;

        try {
            await axios.delete(`/api/positions/${id}`);
            setAlert({ message: 'Designation deleted successfully', type: 'success' });
            fetchPositions();
        } catch (error) {
            setAlert({ message: 'Failed to delete designation', type: 'error' });
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <i className="fas fa-spinner fa-spin text-gray-600 text-2xl"></i>
                </div>
                <p className="text-gray-600 font-medium">Loading...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6">
                    <Alert message={alert?.message} type={alert?.type} onClose={() => setAlert(null)} />

                    <h1 className="text-2xl font-bold text-[#010066] mb-6">Designations</h1>

                    <form onSubmit={handleAdd} className="mb-6 flex gap-3">
                        <input
                            type="text"
                            value={newPosition}
                            onChange={(e) => setNewPosition(e.target.value)}
                            placeholder="Enter designation name..."
                            className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#010066] focus:border-transparent"
                        />
                        <button type="submit" className="bg-[#010066] text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm">
                            Add Designation
                        </button>
                    </form>

            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {!positions || positions.length === 0 ? (
                        <tr>
                            <td colSpan="2" className="px-4 py-4 text-center text-gray-500">No designations found.</td>
                        </tr>
                    ) : (
                        positions.map((position) => (
                            <tr key={position.position_id}>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {editingPosition === position.position_id ? (
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="bg-white border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#010066] focus:border-transparent"
                                            autoFocus
                                        />
                                    ) : (
                                        <span className="font-medium text-gray-900">{position.position_name}</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                                    {editingPosition === position.position_id ? (
                                        <>
                                            <button
                                                onClick={() => handleUpdate(position.position_id)}
                                                className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-xs"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingPosition(null)}
                                                className="bg-gray-600 text-white px-3 py-1.5 rounded hover:bg-gray-700 text-xs"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleEdit(position)}
                                                className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-xs"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(position.position_id)}
                                                className="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 text-xs"
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
            </div>
        </div>
    );
};

export default PositionList;
