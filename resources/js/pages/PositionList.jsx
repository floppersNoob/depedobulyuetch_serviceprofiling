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

    if (loading) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto">
            <Alert message={alert?.message} type={alert?.type} onClose={() => setAlert(null)} />

            <h1 className="text-2xl font-bold text-gray-800 mb-6">Designations</h1>

            <form onSubmit={handleAdd} className="mb-6 flex space-x-2">
                <input
                    type="text"
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    placeholder="Enter designation name..."
                    className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Add Designation
                </button>
            </form>

            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {!positions || positions.length === 0 ? (
                        <tr>
                            <td colSpan="2" className="px-6 py-4 text-center text-gray-500">No designations found.</td>
                        </tr>
                    ) : (
                        positions.map((position) => (
                            <tr key={position.position_id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {editingPosition === position.position_id ? (
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="border border-gray-300 rounded px-2 py-1 w-full"
                                            autoFocus
                                        />
                                    ) : (
                                        <span className="font-medium text-gray-900">{position.position_name}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    {editingPosition === position.position_id ? (
                                        <>
                                            <button
                                                onClick={() => handleUpdate(position.position_id)}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingPosition(null)}
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleEdit(position)}
                                                className="text-yellow-600 hover:text-yellow-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(position.position_id)}
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

export default PositionList;
