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
        <div className="min-h-screen bg-gradient-to-b from-gray-50/80 to-white p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-sm p-6">
                    <Alert message={alert?.message} type={alert?.type} onClose={() => setAlert(null)} />

                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-6">Advanced Search</h1>

                    <div className="space-y-4">
                        {/* Search by Employee Name */}
                        <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200/40">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Search by Employee Name</h2>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                                    <input
                                        type="text"
                                        value={nameSearch}
                                        onChange={(e) => setNameSearch(e.target.value)}
                                        placeholder="Enter name..."
                                        className="w-full bg-white border border-gray-200/80 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
                                    />
                                </div>
                                <button
                                    onClick={() => searchByEmployee()}
                                    className="bg-[#007aff] text-white px-4 py-2.5 rounded-xl hover:bg-[#0056b3] transition-all text-sm font-semibold shadow-sm"
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Search by Position */}
                        <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200/40">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Search by Designation</h2>
                            <div className="flex gap-2">
                                <select
                                    value={selectedPosition}
                                    onChange={(e) => setSelectedPosition(e.target.value)}
                                    className="flex-1 bg-white border border-gray-200/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
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
                                    className="bg-[#007aff] text-white px-4 py-2.5 rounded-xl hover:bg-[#0056b3] transition-all text-sm font-semibold shadow-sm"
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Search by Date Range */}
                        <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200/40">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Search by Date Range</h2>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="bg-white border border-gray-200/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
                                />
                                <span className="text-gray-400 text-sm">to</span>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="bg-white border border-gray-200/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
                                />
                                <button
                                    onClick={() => searchByDateRange()}
                                    className="bg-[#007aff] text-white px-4 py-2.5 rounded-xl hover:bg-[#0056b3] transition-all text-sm font-semibold shadow-sm"
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    {results && (
                        <div className="mt-8">
                            <h2 className="text-lg font-semibold text-gray-900 tracking-tight mb-4">Search Results</h2>

                            <div className="rounded-xl overflow-hidden border border-gray-200/60">
                                {results.type === 'employee' && (
                                    <table className="min-w-full divide-y divide-gray-100">
                                        <thead className="bg-gray-50/80">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Birth Date</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Records</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {!results.data || results.data.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="px-4 py-8 text-center text-gray-400 text-sm">No results found.</td>
                                                </tr>
                                            ) : (
                                                results.data.map((emp) => (
                                                    <tr key={emp.employee_id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{emp.surname}, {emp.given_name}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{emp.birth_date || '-'}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{emp.service_records_count}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                                            <Link to={`/employees/${emp.employee_id}`} className="text-[#007aff] hover:text-[#0056b3] font-medium text-sm">View</Link>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                )}

                                {(results.type === 'position' || results.type === 'date_range') && (
                                    <table className="min-w-full divide-y divide-gray-100">
                                        <thead className="bg-gray-50/80">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Employee</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Designation</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Period</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {!results.data || results.data.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-400 text-sm">No results found.</td>
                                                </tr>
                                            ) : (
                                                results.data.map((record) => (
                                                    <tr key={record.service_id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                                                            {record.employee?.surname || 'N/A'}, {record.employee?.given_name || ''}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{record.position?.position_name || '-'}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                            {record.date_from} - {record.date_to || 'Present'}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{record.employment_status?.status_name || '-'}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                                            <Link to={`/service-records/${record.service_id}/edit`} className="text-[#007aff] hover:text-[#0056b3] font-medium text-sm">Edit</Link>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>

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
            </div>
        </div>
    );
};

export default Search;
