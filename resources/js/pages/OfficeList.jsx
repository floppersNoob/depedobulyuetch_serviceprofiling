import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Alert from '../components/Alert.jsx';

const OfficeList = () => {
    const [offices, setOffices] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        department: '',
        division: '',
        branch: '',
        station_place: ''
    });
    const [editingOffice, setEditingOffice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchOffices();
    }, []);

    const fetchOffices = async () => {
        try {
            const response = await axios.get('/api/offices');
            setOffices(response.data || []);
        } catch (error) {
            setAlert({ message: 'Failed to load offices', type: 'error' });
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingOffice) {
                await axios.put(`/api/offices/${editingOffice}`, formData);
                setAlert({ message: 'Office updated successfully', type: 'success' });
            } else {
                await axios.post('/api/offices', formData);
                setAlert({ message: 'Office added successfully', type: 'success' });
            }
            resetForm();
            fetchOffices();
        } catch (error) {
            setAlert({ message: `Failed to ${editingOffice ? 'update' : 'add'} office`, type: 'error' });
        }
    };

    const handleEdit = (office) => {
        setEditingOffice(office.office_id);
        setFormData({
            department: office.department,
            division: office.division || '',
            branch: office.branch || '',
            station_place: office.station_place || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this office?')) return;

        try {
            await axios.delete(`/api/offices/${id}`);
            setAlert({ message: 'Office deleted successfully', type: 'success' });
            fetchOffices();
        } catch (error) {
            setAlert({ message: 'Failed to delete office', type: 'error' });
        }
    };

    const resetForm = () => {
        setFormData({ department: '', division: '', branch: '', station_place: '' });
        setEditingOffice(null);
        setShowForm(false);
    };

    if (loading) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <Alert message={alert?.message} type={alert?.type} onClose={() => setAlert(null)} />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Offices</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    {showForm ? 'Cancel' : 'Add Office'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                            <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                required
                                placeholder="e.g., DPWH"
                                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                            <input
                                type="text"
                                name="division"
                                value={formData.division}
                                onChange={handleChange}
                                placeholder="e.g., CDOC-1ST DE"
                                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                            <input
                                type="text"
                                name="branch"
                                value={formData.branch}
                                onChange={handleChange}
                                placeholder="e.g., Nat'l"
                                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Station/Place</label>
                            <input
                                type="text"
                                name="station_place"
                                value={formData.station_place}
                                onChange={handleChange}
                                placeholder="e.g., Carmen, Cagayan de Oro City"
                                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            {editingOffice ? 'Update Office' : 'Save Office'}
                        </button>
                    </div>
                </form>
            )}

            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Division</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Station</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {!offices || offices.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No offices found.</td>
                        </tr>
                    ) : (
                        offices.map((office) => (
                            <tr key={office.office_id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                    {office.department}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {office.division || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {office.branch || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {office.station_place || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => handleEdit(office)}
                                        className="text-yellow-600 hover:text-yellow-900"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(office.office_id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default OfficeList;
