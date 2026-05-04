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
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-sm p-6">
                    <Alert message={alert?.message} type={alert?.type} onClose={() => setAlert(null)} />

                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Offices</h1>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className={`px-4 py-2.5 rounded-xl transition-all text-sm font-semibold ${
                                showForm 
                                    ? 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80' 
                                    : 'bg-[#007aff] text-white shadow-sm hover:bg-[#0056b3]'
                            }`}
                        >
                            {showForm ? 'Cancel' : 'Add Office'}
                        </button>
                    </div>

                    {showForm && (
                        <form onSubmit={handleSubmit} className="mb-6 p-5 bg-gray-50/80 rounded-xl border border-gray-200/40">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Department <span className="text-[#ff3b30]">*</span></label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., DPWH"
                                        className="w-full bg-white border border-gray-200/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Division</label>
                                    <input
                                        type="text"
                                        name="division"
                                        value={formData.division}
                                        onChange={handleChange}
                                        placeholder="e.g., CDOC-1ST DE"
                                        className="w-full bg-white border border-gray-200/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Branch</label>
                                    <input
                                        type="text"
                                        name="branch"
                                        value={formData.branch}
                                        onChange={handleChange}
                                        placeholder="e.g., Nat'l"
                                        className="w-full bg-white border border-gray-200/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Station/Place</label>
                                    <input
                                        type="text"
                                        name="station_place"
                                        value={formData.station_place}
                                        onChange={handleChange}
                                        placeholder="e.g., Carmen, Cagayan de Oro City"
                                        className="w-full bg-white border border-gray-200/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between gap-3 mt-5 pt-4 border-t border-gray-200/50">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-5 py-2.5 bg-gray-100/80 text-gray-600 rounded-xl hover:bg-gray-200/80 transition-all text-sm font-semibold"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="px-5 py-2.5 bg-[#007aff] text-white rounded-xl hover:bg-[#0056b3] transition-all text-sm font-semibold shadow-sm">
                                    {editingOffice ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="rounded-xl overflow-hidden border border-gray-200/60">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/80">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Department</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Division</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Branch</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Station</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {!offices || offices.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-400 text-sm">No offices found.</td>
                                    </tr>
                                ) : (
                                    offices.map((office) => (
                                        <tr key={office.office_id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                                                {office.department}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {office.division || '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {office.branch || '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {office.station_place || '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleEdit(office)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#007aff]/10 text-[#007aff] hover:bg-[#007aff]/20 transition-all"
                                                        title="Edit"
                                                    >
                                                        <i className="fas fa-pencil-alt text-xs"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(office.office_id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#ff3b30]/10 text-[#ff3b30] hover:bg-[#ff3b30]/20 transition-all"
                                                        title="Delete"
                                                    >
                                                        <i className="fas fa-trash text-xs"></i>
                                                    </button>
                                                </div>
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

export default OfficeList;
