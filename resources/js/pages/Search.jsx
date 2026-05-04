import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Pagination from '../components/Pagination.jsx';

const Search = () => {
    const [positions, setPositions] = useState([]);
    const [results, setResults] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    // Search form states
    const [nameSearch, setNameSearch] = useState('');
    const [selectedPosition, setSelectedPosition] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        fetchPositions();
    }, []);

    const fetchPositions = async () => {
        try {
            const response = await axios.get('/api/positions');
            setPositions(response.data || []);
        } catch (error) {
        }
    };

    const searchByEmployee = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get('/api/search', {
                params: { search_type: 'employee', name: nameSearch, page }
            });
            setResults({ type: 'employee', data: response.data.data || [] });
            setPagination(response.data);
        } catch (error) {
            setAlert({ message: 'Search failed', type: 'error' });
        }
        setLoading(false);
    };

    const searchByPosition = async (page = 1) => {
        if (!selectedPosition) return;
        setLoading(true);
        try {
            const response = await axios.get('/api/search', {
                params: { search_type: 'position', position_id: selectedPosition, page }
            });
            setResults({ type: 'position', data: response.data.data || [] });
            setPagination(response.data);
        } catch (error) {
            setAlert({ message: 'Search failed', type: 'error' });
        }
        setLoading(false);
    };

    const searchByDateRange = async (page = 1) => {
        if (!dateFrom || !dateTo) return;
        setLoading(true);
        try {
            const response = await axios.get('/api/search', {
                params: { search_type: 'date_range', date_from: dateFrom, date_to: dateTo, page }
            });
            setResults({ type: 'date_range', data: response.data.data || [] });
            setPagination(response.data);
        } catch (error) {
            setAlert({ message: 'Search failed', type: 'error' });
        }
        setLoading(false);
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <Alert message={alert?.message} type={alert?.type} onClose={() => setAlert(null)} />

            <h1 className="text-2xl font-bold text-gray-800 mb-6">Advanced Search</h1>

            <div className="space-y-6">
                {/* Search by Employee Name */}
                <div className="border border-gray-200 rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Search by Employee Name</h2>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={nameSearch}
                            onChange={(e) => setNameSearch(e.target.value)}
                            placeholder="Enter name..."
                            className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={() => searchByEmployee()}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Search by Position */}
                <div className="border border-gray-200 rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Search by Designation</h2>
                    <div className="flex space-x-2">
                        <select
                            value={selectedPosition}
                            onChange={(e) => setSelectedPosition(e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Designation</option>
                            {positions && positions.map((pos) => (
                                <option key={pos.position_id} value={pos.position_id}>
                                    {pos.position_name}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => searchByPosition()}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Search by Date Range */}
                <div className="border border-gray-200 rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Search by Date Range</h2>
                    <div className="flex space-x-2 items-center">
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span>to</span>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={() => searchByDateRange()}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Results */}
            {results && (
                <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Search Results</h2>

                    {results.type === 'employee' && (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Birth Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Records</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {!results.data || results.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No results found.</td>
                                    </tr>
                                ) : (
                                    results.data.map((emp) => (
                                        <tr key={emp.employee_id}>
                                            <td className="px-6 py-4 whitespace-nowrap">{emp.surname}, {emp.given_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.birth_date || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.service_records_count}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link to={`/employees/${emp.employee_id}`} className="text-blue-600 hover:text-blue-900">View</Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}

                    {(results.type === 'position' || results.type === 'date_range') && (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {!results.data || results.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No results found.</td>
                                    </tr>
                                ) : (
                                    results.data.map((record) => (
                                        <tr key={record.service_id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {record.employee?.surname || 'N/A'}, {record.employee?.given_name || ''}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{record.position?.position_name || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {record.date_from} - {record.date_to || 'Present'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{record.employment_status?.status_name || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link to={`/service-records/${record.service_id}/edit`} className="text-blue-600 hover:text-blue-900">Edit</Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}

                    <Pagination
                        data={pagination}
                        onPageChange={(page) => {
                            if (results.type === 'employee') searchByEmployee(page);
                            else if (results.type === 'position') searchByPosition(page);
                            else if (results.type === 'date_range') searchByDateRange(page);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default Search;
