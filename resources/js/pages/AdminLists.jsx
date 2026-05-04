import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Alert from '../components/Alert.jsx';

const AdminLists = () => {
    const [activeTab, setActiveTab] = useState('designations'); // 'designations', 'offices', 'statuses'
    
    // Designations state
    const [positions, setPositions] = useState([]);
    const [newPosition, setNewPosition] = useState('');
    const [editingPosition, setEditingPosition] = useState(null);
    const [editPositionValue, setEditPositionValue] = useState('');
    const [positionSearch, setPositionSearch] = useState('');
    
    // Offices state
    const [offices, setOffices] = useState([]);
    const [showOfficeForm, setShowOfficeForm] = useState(false);
    const [officeFormData, setOfficeFormData] = useState({
        department: '',
        division: '',
        branch: '',
        station_place: ''
    });
    const [editingOffice, setEditingOffice] = useState(null);
    const [officeSearch, setOfficeSearch] = useState('');
    
    // Statuses state
    const [statuses, setStatuses] = useState([]);
    const [newStatus, setNewStatus] = useState('');
    const [editingStatus, setEditingStatus] = useState(null);
    const [editStatusValue, setEditStatusValue] = useState('');
    const [statusSearch, setStatusSearch] = useState('');
    
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    // Filtered data
    const filteredPositions = positions.filter(pos => 
        pos.position_name.toLowerCase().includes(positionSearch.toLowerCase())
    );
    
    const filteredOffices = offices.filter(off => 
        off.department.toLowerCase().includes(officeSearch.toLowerCase()) ||
        (off.division && off.division.toLowerCase().includes(officeSearch.toLowerCase())) ||
        (off.branch && off.branch.toLowerCase().includes(officeSearch.toLowerCase())) ||
        (off.station_place && off.station_place.toLowerCase().includes(officeSearch.toLowerCase()))
    );
    
    const filteredStatuses = statuses.filter(stat => 
        stat.status_name.toLowerCase().includes(statusSearch.toLowerCase())
    );

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [posRes, offRes, statRes] = await Promise.all([
                axios.get('/api/positions'),
                axios.get('/api/offices'),
                axios.get('/api/employment-status')
            ]);
            setPositions(posRes.data || []);
            setOffices(offRes.data || []);
            setStatuses(statRes.data || []);
        } catch (error) {
            setAlert({ message: 'Failed to load data', type: 'error' });
        }
        setLoading(false);
    };

    // Designations handlers
    const handleAddPosition = async (e) => {
        e.preventDefault();
        if (!newPosition.trim()) return;

        try {
            await axios.post('/api/positions', { position_name: newPosition });
            setNewPosition('');
            setAlert({ message: 'Designation added successfully', type: 'success' });
            fetchAllData();
        } catch (error) {
            setAlert({ message: 'Failed to add designation', type: 'error' });
        }
    };

    const handleEditPosition = (position) => {
        setEditingPosition(position.position_id);
        setEditPositionValue(position.position_name);
    };

    const handleUpdatePosition = async (id) => {
        try {
            await axios.put(`/api/positions/${id}`, { position_name: editPositionValue });
            setEditingPosition(null);
            setAlert({ message: 'Designation updated successfully', type: 'success' });
            fetchAllData();
        } catch (error) {
            setAlert({ message: 'Failed to update designation', type: 'error' });
        }
    };

    const handleDeletePosition = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Designation?',
            text: 'Are you sure you want to delete this designation?',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#ff3b30',
            cancelButtonColor: '#8e8e93',
            reverseButtons: true,
            background: '#fff',
            backdrop: 'rgba(0,0,0,0.4)',
            showClass: { popup: 'animate__animated animate__fadeIn' },
            hideClass: { popup: 'animate__animated animate__fadeOut' },
            customClass: {
                popup: 'ios-alert-popup',
                title: 'ios-alert-title',
                confirmButton: 'ios-alert-btn-danger',
                cancelButton: 'ios-alert-btn-cancel',
                actions: 'ios-alert-actions'
            }
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(`/api/positions/${id}`);
            setAlert({ message: 'Designation deleted successfully', type: 'success' });
            fetchAllData();
        } catch (error) {
            if (error.response?.status === 422) {
                Swal.fire({
                    title: 'Cannot Delete',
                    text: error.response.data.message || 'This designation is in use and cannot be deleted.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#007aff',
                    background: '#fff',
                    backdrop: 'rgba(0,0,0,0.4)',
                    showClass: { popup: 'animate__animated animate__fadeIn' },
                    hideClass: { popup: 'animate__animated animate__fadeOut' },
                    customClass: {
                        popup: 'ios-alert-popup',
                        title: 'ios-alert-title',
                        confirmButton: 'ios-alert-btn'
                    }
                });
            } else {
                setAlert({ message: 'Failed to delete designation', type: 'error' });
            }
        }
    };

    // Offices handlers
    const handleOfficeChange = (e) => {
        setOfficeFormData({ ...officeFormData, [e.target.name]: e.target.value });
    };

    const handleOfficeSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingOffice) {
                await axios.put(`/api/offices/${editingOffice}`, officeFormData);
                setAlert({ message: 'Office updated successfully', type: 'success' });
            } else {
                await axios.post('/api/offices', officeFormData);
                setAlert({ message: 'Office added successfully', type: 'success' });
            }
            resetOfficeForm();
            fetchAllData();
        } catch (error) {
            setAlert({ message: `Failed to ${editingOffice ? 'update' : 'add'} office`, type: 'error' });
        }
    };

    const handleEditOffice = (office) => {
        setEditingOffice(office.office_id);
        setOfficeFormData({
            department: office.department,
            division: office.division || '',
            branch: office.branch || '',
            station_place: office.station_place || ''
        });
        setShowOfficeForm(true);
    };

    const handleDeleteOffice = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Office?',
            text: 'Are you sure you want to delete this office?',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#ff3b30',
            cancelButtonColor: '#8e8e93',
            reverseButtons: true,
            background: '#fff',
            backdrop: 'rgba(0,0,0,0.4)',
            showClass: { popup: 'animate__animated animate__fadeIn' },
            hideClass: { popup: 'animate__animated animate__fadeOut' },
            customClass: {
                popup: 'ios-alert-popup',
                title: 'ios-alert-title',
                confirmButton: 'ios-alert-btn-danger',
                cancelButton: 'ios-alert-btn-cancel',
                actions: 'ios-alert-actions'
            }
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(`/api/offices/${id}`);
            setAlert({ message: 'Office deleted successfully', type: 'success' });
            fetchAllData();
        } catch (error) {
            if (error.response?.status === 422) {
                Swal.fire({
                    title: 'Cannot Delete',
                    text: error.response.data.message || 'This office is in use and cannot be deleted.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#007aff',
                    background: '#fff',
                    backdrop: 'rgba(0,0,0,0.4)',
                    showClass: { popup: 'animate__animated animate__fadeIn' },
                    hideClass: { popup: 'animate__animated animate__fadeOut' },
                    customClass: {
                        popup: 'ios-alert-popup',
                        title: 'ios-alert-title',
                        confirmButton: 'ios-alert-btn'
                    }
                });
            } else {
                setAlert({ message: 'Failed to delete office', type: 'error' });
            }
        }
    };

    const resetOfficeForm = () => {
        setOfficeFormData({ department: '', division: '', branch: '', station_place: '' });
        setEditingOffice(null);
        setShowOfficeForm(false);
    };

    // Statuses handlers
    const handleAddStatus = async (e) => {
        e.preventDefault();
        if (!newStatus.trim()) return;

        try {
            await axios.post('/api/employment-status', { status_name: newStatus });
            setNewStatus('');
            setAlert({ message: 'Employment status added successfully', type: 'success' });
            fetchAllData();
        } catch (error) {
            setAlert({ message: 'Failed to add employment status', type: 'error' });
        }
    };

    const handleEditStatus = (status) => {
        setEditingStatus(status.status_id);
        setEditStatusValue(status.status_name);
    };

    const handleUpdateStatus = async (id) => {
        try {
            await axios.put(`/api/employment-status/${id}`, { status_name: editStatusValue });
            setEditingStatus(null);
            setAlert({ message: 'Employment status updated successfully', type: 'success' });
            fetchAllData();
        } catch (error) {
            setAlert({ message: 'Failed to update employment status', type: 'error' });
        }
    };

    const handleDeleteStatus = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Status?',
            text: 'Are you sure you want to delete this employment status?',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#ff3b30',
            cancelButtonColor: '#8e8e93',
            reverseButtons: true,
            background: '#fff',
            backdrop: 'rgba(0,0,0,0.4)',
            showClass: { popup: 'animate__animated animate__fadeIn' },
            hideClass: { popup: 'animate__animated animate__fadeOut' },
            customClass: {
                popup: 'ios-alert-popup',
                title: 'ios-alert-title',
                confirmButton: 'ios-alert-btn-danger',
                cancelButton: 'ios-alert-btn-cancel',
                actions: 'ios-alert-actions'
            }
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(`/api/employment-status/${id}`);
            setAlert({ message: 'Employment status deleted successfully', type: 'success' });
            fetchAllData();
        } catch (error) {
            if (error.response?.status === 422) {
                Swal.fire({
                    title: 'Cannot Delete',
                    text: error.response.data.message || 'This employment status is in use and cannot be deleted.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#007aff',
                    background: '#fff',
                    backdrop: 'rgba(0,0,0,0.4)',
                    showClass: { popup: 'animate__animated animate__fadeIn' },
                    hideClass: { popup: 'animate__animated animate__fadeOut' },
                    customClass: {
                        popup: 'ios-alert-popup',
                        title: 'ios-alert-title',
                        confirmButton: 'ios-alert-btn'
                    }
                });
            } else {
                setAlert({ message: 'Failed to delete employment status', type: 'error' });
            }
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
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6">
                    <Alert message={alert?.message} type={alert?.type} onClose={() => setAlert(null)} />

                    <h1 className="text-2xl font-bold text-[#010066] mb-6">Admin Lists</h1>

                    {/* Tab Navigation */}
                    <div className="flex gap-2 mb-6 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('designations')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                activeTab === 'designations'
                                    ? 'text-[#010066] border-b-2 border-[#010066]'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Designations
                        </button>
                        <button
                            onClick={() => setActiveTab('offices')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                activeTab === 'offices'
                                    ? 'text-[#010066] border-b-2 border-[#010066]'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Offices
                        </button>
                        <button
                            onClick={() => setActiveTab('statuses')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                activeTab === 'statuses'
                                    ? 'text-[#010066] border-b-2 border-[#010066]'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Employment Status
                        </button>
                    </div>

                    {/* Designations Tab */}
                    {activeTab === 'designations' && (
                        <>
                            <div className="mb-6 flex gap-3">
                                <input
                                    type="text"
                                    value={positionSearch}
                                    onChange={(e) => setPositionSearch(e.target.value)}
                                    placeholder="Search designations..."
                                    className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#010066] focus:border-transparent"
                                />
                                <button
                                    onClick={() => {
                                        setNewPosition('');
                                        setEditingPosition(null);
                                    }}
                                    className="bg-[#010066] text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                                >
                                    Add Designation
                                </button>
                            </div>
                            {newPosition !== '' || editingPosition !== null ? (
                                <form onSubmit={handleAddPosition} className="mb-6 p-4 bg-gray-50 rounded">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Designation Name</label>
                                        <input
                                            type="text"
                                            value={newPosition}
                                            onChange={(e) => setNewPosition(e.target.value)}
                                            placeholder="Enter designation name..."
                                            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#010066] focus:border-transparent"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3 mt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNewPosition('');
                                                setEditingPosition(null);
                                            }}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="px-4 py-2 bg-[#010066] text-white rounded hover:bg-blue-700 transition-colors text-sm">
                                            Save Designation
                                        </button>
                                    </div>
                                </form>
                            ) : null}

                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {!filteredPositions || filteredPositions.length === 0 ? (
                                        <tr>
                                            <td colSpan="2" className="px-4 py-4 text-center text-gray-500">{positionSearch ? 'No designations found matching your search.' : 'No designations found.'}</td>
                                        </tr>
                                    ) : (
                                        filteredPositions.map((position) => (
                                            <tr key={position.position_id}>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {editingPosition === position.position_id ? (
                                                        <input
                                                            type="text"
                                                            value={editPositionValue}
                                                            onChange={(e) => setEditPositionValue(e.target.value)}
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
                                                                onClick={() => handleUpdatePosition(position.position_id)}
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
                                                                onClick={() => handleEditPosition(position)}
                                                                className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-xs"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeletePosition(position.position_id)}
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
                        </>
                    )}

                    {/* Offices Tab */}
                    {activeTab === 'offices' && (
                        <>
                            <div className="mb-6 flex gap-3">
                                <input
                                    type="text"
                                    value={officeSearch}
                                    onChange={(e) => setOfficeSearch(e.target.value)}
                                    placeholder="Search offices (department, division, branch, station)..."
                                    className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#010066] focus:border-transparent"
                                />
                                <button
                                    onClick={() => {
                                        resetOfficeForm();
                                        setShowOfficeForm(!showOfficeForm);
                                    }}
                                    className="bg-[#010066] text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                                >
                                    {showOfficeForm ? 'Cancel' : 'Add Office'}
                                </button>
                            </div>

                            {showOfficeForm && (
                                <form onSubmit={handleOfficeSubmit} className="mb-6 p-4 bg-gray-50 rounded">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                                            <input
                                                type="text"
                                                name="department"
                                                value={officeFormData.department}
                                                onChange={handleOfficeChange}
                                                required
                                                placeholder="e.g., DPWH"
                                                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#010066] focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                                            <input
                                                type="text"
                                                name="division"
                                                value={officeFormData.division}
                                                onChange={handleOfficeChange}
                                                placeholder="e.g., CDOC-1ST DE"
                                                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#010066] focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                                            <input
                                                type="text"
                                                name="branch"
                                                value={officeFormData.branch}
                                                onChange={handleOfficeChange}
                                                placeholder="e.g., Nat'l"
                                                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#010066] focus:border-transparent"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Station/Place</label>
                                            <input
                                                type="text"
                                                name="station_place"
                                                value={officeFormData.station_place}
                                                onChange={handleOfficeChange}
                                                placeholder="e.g., Carmen, Cagayan de Oro City"
                                                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#010066] focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between mt-4 gap-3">
                                        <button
                                            type="button"
                                            onClick={resetOfficeForm}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="px-4 py-2 bg-[#010066] text-white rounded hover:bg-blue-700 transition-colors text-sm">
                                            {editingOffice ? 'Update Office' : 'Save Office'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Division</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Station</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {!filteredOffices || filteredOffices.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-4 text-center text-gray-500">{officeSearch ? 'No offices found matching your search.' : 'No offices found.'}</td>
                                        </tr>
                                    ) : (
                                        filteredOffices.map((office) => (
                                            <tr key={office.office_id}>
                                                <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                                                    {office.department}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {office.division || '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {office.branch || '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {office.station_place || '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <button
                                                        onClick={() => handleEditOffice(office)}
                                                        className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-xs"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteOffice(office.office_id)}
                                                        className="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 text-xs"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}

                    {/* Statuses Tab */}
                    {activeTab === 'statuses' && (
                        <>
                            <div className="mb-6 flex gap-3">
                                <input
                                    type="text"
                                    value={statusSearch}
                                    onChange={(e) => setStatusSearch(e.target.value)}
                                    placeholder="Search statuses..."
                                    className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#010066] focus:border-transparent"
                                />
                                <button
                                    onClick={() => {
                                        setNewStatus('');
                                        setEditingStatus(null);
                                    }}
                                    className="bg-[#010066] text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                                >
                                    Add Status
                                </button>
                            </div>
                            {newStatus !== '' || editingStatus !== null ? (
                                <form onSubmit={handleAddStatus} className="mb-6 p-4 bg-gray-50 rounded">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status Name</label>
                                        <input
                                            type="text"
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value)}
                                            placeholder="Enter status name (e.g., Permanent, Temporary)..."
                                            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#010066] focus:border-transparent"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3 mt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNewStatus('');
                                                setEditingStatus(null);
                                            }}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="px-4 py-2 bg-[#010066] text-white rounded hover:bg-blue-700 transition-colors text-sm">
                                            Save Status
                                        </button>
                                    </div>
                                </form>
                            ) : null}

                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {!filteredStatuses || filteredStatuses.length === 0 ? (
                                        <tr>
                                            <td colSpan="2" className="px-4 py-4 text-center text-gray-500">{statusSearch ? 'No employment statuses found matching your search.' : 'No employment statuses found.'}</td>
                                        </tr>
                                    ) : (
                                        filteredStatuses.map((status) => (
                                            <tr key={status.status_id}>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {editingStatus === status.status_id ? (
                                                        <input
                                                            type="text"
                                                            value={editStatusValue}
                                                            onChange={(e) => setEditStatusValue(e.target.value)}
                                                            className="bg-white border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#010066] focus:border-transparent"
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <span className="font-medium text-gray-900">{status.status_name}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                                                    {editingStatus === status.status_id ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleUpdateStatus(status.status_id)}
                                                                className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-xs"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingStatus(null)}
                                                                className="bg-gray-600 text-white px-3 py-1.5 rounded hover:bg-gray-700 text-xs"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleEditStatus(status)}
                                                                className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-xs"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteStatus(status.status_id)}
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminLists;
