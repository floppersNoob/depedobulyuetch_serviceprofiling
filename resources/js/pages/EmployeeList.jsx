import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Pagination from '../components/Pagination.jsx';
import { useToast } from '../components/Toast.jsx';

// Module-level cache for employee list data
const employeesCache = {
    data: null,
    timestamp: 0,
    search: '',
    page: 1
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showSkeleton, setShowSkeleton] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const isInitialLoad = useRef(true);
    const loadingTimeoutRef = useRef(null);
    const minLoadTimeRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        surname: '',
        given_name: '',
        middle_name: '',
        birth_date: '',
        birth_place: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [formLoading, setFormLoading] = useState(false);
    const { addToast } = useToast();

    // Filters
    const [filters, setFilters] = useState({
        office: '',
        position: '',
        status: '',
        yearsOfService: ''
    });
    const [offices, setOffices] = useState([]);
    const [positions, setPositions] = useState([]);
    const [statuses, setStatuses] = useState([]);

    useEffect(() => {
        const cached = employeesCache.data;
        const isCacheValid = cached && (Date.now() - employeesCache.timestamp < CACHE_DURATION) && employeesCache.search === '';

        if (isCacheValid) {
            // Show cached data immediately
            setEmployees(cached.employees);
            setPagination(cached.pagination);
            setLoading(false);
            setShowSkeleton(false);
            // Refresh in background
            fetchEmployees(1, '', true);
        } else {
            // No cache - show skeleton for minimum 2 seconds
            minLoadTimeRef.current = Date.now();
            fetchEmployees(1, '', false);
        }

        fetchFilterData();

        return () => {
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            // Skip cache for search - always fetch fresh
            minLoadTimeRef.current = Date.now();
            fetchEmployees(1, search, false);
        }, 400);

        return () => clearTimeout(delayDebounce);
    }, [search]);

    const fetchEmployees = async (page = 1, searchTerm = '', backgroundRefresh = false) => {
        if (!backgroundRefresh) {
            setLoading(true);
            setShowSkeleton(true);
        } else {
            setIsRefreshing(true);
        }

        try {
            const params = { page, search: searchTerm };
            const response = await axios.get('/api/employees', { params });
            const employeeData = response.data.data || response.data || [];

            // Update state
            setEmployees(employeeData);
            setPagination(response.data);

            // Update cache only for non-search fetches
            if (searchTerm === '') {
                employeesCache.data = {
                    employees: employeeData,
                    pagination: response.data
                };
                employeesCache.timestamp = Date.now();
                employeesCache.search = searchTerm;
                employeesCache.page = page;
            }
        } catch (error) {
            console.error('Fetch error:', error);
            if (!backgroundRefresh) {
                addToast('Failed to load employees', 'error');
            }
        } finally {
            if (!backgroundRefresh) {
                // Ensure minimum 2 second skeleton display
                const elapsed = Date.now() - (minLoadTimeRef.current || Date.now());
                const remaining = Math.max(0, 2000 - elapsed);

                setTimeout(() => {
                    setLoading(false);
                    setShowSkeleton(false);
                }, remaining);
            } else {
                setIsRefreshing(false);
            }
        }
        isInitialLoad.current = false;
    };

    const fetchFilterData = async () => {
        try {
            const [officesRes, positionsRes, statusesRes] = await Promise.all([
                axios.get('/api/offices'),
                axios.get('/api/positions'),
                axios.get('/api/employment-status')
            ]);
            setOffices(officesRes.data);
            setPositions(positionsRes.data);
            setStatuses(statusesRes.data);
        } catch (error) {
            console.error('Failed to fetch filter data:', error);
        }
    };

    const calculateYearsOfService = (employee) => {
        if (!employee.service_records || employee.service_records.length === 0) return 0;

        // Find the earliest date_from (oldest record)
        let earliestDate = null;
        let latestDate = null;

        employee.service_records.forEach(record => {
            const fromDate = new Date(record.date_from);
            const toDate = record.date_to ? new Date(record.date_to) : new Date();

            if (!earliestDate || fromDate < earliestDate) {
                earliestDate = fromDate;
            }
            if (!latestDate || toDate > latestDate) {
                latestDate = toDate;
            }
        });

        if (!earliestDate) return 0;

        const years = (latestDate - earliestDate) / (1000 * 60 * 60 * 24 * 365);
        return years;
    };

    const filteredEmployees = useMemo(() => {
        return employees.filter(employee => {
            // Filter by office (based on most recent service record)
            if (filters.office) {
                if (!employee.service_records || employee.service_records.length === 0) return false;
                const latestRecord = employee.service_records[0];
                if (latestRecord.office?.office_id != filters.office) return false;
            }

            // Filter by position (based on most recent service record)
            if (filters.position) {
                if (!employee.service_records || employee.service_records.length === 0) return false;
                const latestRecord = employee.service_records[0];
                if (latestRecord.position?.position_id != filters.position) return false;
            }

            // Filter by status (based on most recent service record)
            if (filters.status) {
                if (!employee.service_records || employee.service_records.length === 0) return false;
                const latestRecord = employee.service_records[0];
                if (latestRecord.employment_status?.status_id != filters.status) return false;
            }

            // Filter by years of service
            if (filters.yearsOfService) {
                const years = calculateYearsOfService(employee);
                switch (filters.yearsOfService) {
                    case '0-5':
                        if (years < 0 || years > 5) return false;
                        break;
                    case '5-10':
                        if (years < 5 || years > 10) return false;
                        break;
                    case '10+':
                        if (years < 10) return false;
                        break;
                }
            }

            return true;
        });
    }, [employees, filters]);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this employee?')) return;

        try {
            await axios.delete(`/api/employees/${id}`);
            addToast('Employee deleted successfully', 'success');
            // Clear cache to force fresh data
            employeesCache.data = null;
            employeesCache.timestamp = 0;
            fetchEmployees(1, search, false);
        } catch (error) {
            addToast('Failed to delete employee', 'error');
        }
    };

    const openModal = () => {
        setFormData({
            surname: '',
            given_name: '',
            middle_name: '',
            birth_date: '',
            birth_place: ''
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormErrors({});
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setFormErrors({ ...formErrors, [e.target.name]: null });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});
        setFormLoading(true);

        try {
            await axios.post('/api/employees', formData);
            addToast('Employee created successfully', 'success');
            closeModal();
            // Clear cache to force fresh data
            employeesCache.data = null;
            employeesCache.timestamp = 0;
            fetchEmployees(1, search, false);
        } catch (error) {
            if (error.response?.data?.errors) {
                setFormErrors(error.response.data.errors);
            } else {
                addToast('Failed to create employee', 'error');
            }
        }
        setFormLoading(false);
    };

    // Only show skeleton if loading AND no cached employees to display
    if (showSkeleton && employees.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-8 bg-gray-200 rounded w-32 animate-shimmer"></div>
                    <div className="h-10 bg-gray-200 rounded w-32 animate-shimmer"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-10 bg-gray-200 rounded animate-shimmer" style={{animationDelay: `${i * 100}ms`}}></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="bg-white rounded-xl shadow p-6" style={{animationDelay: `${i * 100}ms`}}>
                            <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 bg-gray-200 rounded-full animate-shimmer"></div>
                                <div className="flex-1">
                                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-shimmer"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-shimmer"></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="h-12 bg-gray-200 rounded animate-shimmer"></div>
                                <div className="h-12 bg-gray-200 rounded animate-shimmer"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-dpwh-blue">Employees</h1>
                    {isRefreshing && (
                        <span className="text-xs text-gray-500 animate-pulse">
                            <i className="fas fa-sync-alt fa-spin mr-1"></i>Updating...
                        </span>
                    )}
                </div>
                <button
                    onClick={openModal}
                    className="glass-card text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 hover:shadow-md hover:scale-105 font-medium transition-all duration-300"
                >
                    <i className="fas fa-plus mr-2"></i>Add Employee
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                {/* Filter Dropdowns - Left Side */}
                <div className="flex flex-wrap gap-3">
                    <select
                        value={filters.office}
                        onChange={(e) => setFilters({...filters, office: e.target.value})}
                        className="glass-card px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-dpwh-blue"
                    >
                        <option value="">All Offices</option>
                        {offices.map(office => (
                            <option key={office.office_id} value={office.office_id}>
                                {office.department} {office.branch && `(${office.branch})`}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filters.position}
                        onChange={(e) => setFilters({...filters, position: e.target.value})}
                        className="glass-card px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-dpwh-blue"
                    >
                        <option value="">All Designations</option>
                        {positions.map(position => (
                            <option key={position.position_id} value={position.position_id}>
                                {position.position_name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                        className="glass-card px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-dpwh-blue"
                    >
                        <option value="">All Status</option>
                        {statuses.map(status => (
                            <option key={status.status_id} value={status.status_id}>
                                {status.status_name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Search and Reset - Right Side */}
                <div className="flex items-center gap-3 md:ml-auto">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search..."
                        className="glass-card w-64 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-dpwh-blue placeholder-gray-500"
                    />
                    <button
                        onClick={() => {
                            setSearch('');
                            setFilters({ office: '', position: '', status: '', yearsOfService: '' });
                        }}
                        className="glass-card text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 hover:text-[#eb3505] hover:shadow-md font-medium transition-all duration-300 whitespace-nowrap"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

            {/* Modern Card Grid */}
            {filteredEmployees.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow">
                    <div className="text-6xl mb-4 text-gray-400"><i className="fas fa-users-slash"></i></div>
                    <h3 className="text-lg font-semibold text-dpwh-blue mb-2">No employees found</h3>
                    <p className="text-gray-500 mb-4">Get started by adding your first employee</p>
                    <button
                        onClick={openModal}
                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Add Employee
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredEmployees.map((employee) => (
                        <div key={employee.employee_id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2"></div>
                            <div className="p-6">
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center text-xl font-bold shadow-lg">
                                        {employee.surname.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-dpwh-blue text-lg group-hover:text-blue-600 transition-colors">
                                            {employee.surname}, {employee.given_name}
                                        </h3>
                                        <p className="text-sm text-gray-500">{employee.middle_name || ''}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {employee.service_records && employee.service_records.length > 0 && (
                                        <div className="bg-blue-50 rounded-lg p-3">
                                            <div className="text-xs text-gray-500 mb-1">Designation</div>
                                            <div className="text-sm font-semibold text-dpwh-blue truncate">
                                                {employee.service_records[0]?.position?.position_name || '-'}
                                            </div>
                                        </div>
                                    )}
                                    {employee.service_records && employee.service_records.length > 0 && (
                                        <div className="bg-green-50 rounded-lg p-3">
                                            <div className="text-xs text-gray-500 mb-1">Status</div>
                                            <div className="text-sm font-semibold text-green-700 truncate">
                                                {employee.service_records[0]?.employment_status?.status_name || '-'}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                                    <div className="flex items-center">
                                        <i className="fas fa-clipboard-list mr-2 text-blue-500"></i>
                                        <span>{employee.service_records_count || 0} records</span>
                                    </div>
                                    {employee.birth_date && (
                                        <div className="flex items-center">
                                            <i className="fas fa-birthday-cake mr-2 text-pink-500"></i>
                                            <span>{new Date(employee.birth_date).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex space-x-2">
                                    <Link
                                        to={`/employees/${employee.employee_id}`}
                                        className="flex-1 text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg"
                                    >
                                        View Details
                                    </Link>
                                    <Link
                                        to={`/employees/${employee.employee_id}/edit`}
                                        className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-all duration-300 text-sm font-medium"
                                    >
                                        <i className="fas fa-edit"></i>
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(employee.employee_id)}
                                        className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-300 text-sm font-medium"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Pagination data={pagination} onPageChange={(page) => fetchEmployees(page, search)} />

            {/* Add Employee Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
                    <div
                        className="absolute inset-0 bg-gray-900/30 backdrop-blur-md transition-opacity duration-300"
                        onClick={closeModal}
                    ></div>

                    <div className="relative glass-card rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] max-w-2xl w-full z-10 max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200/50">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl w-10 h-10 flex items-center justify-center shadow-lg">
                                    <i className="fas fa-user-plus"></i>
                                </div>
                                <h2 className="text-xl font-bold text-dpwh-blue">Add New Employee</h2>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-700">Surname *</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="surname"
                                            value={formData.surname}
                                            onChange={handleFormChange}
                                            required
                                            placeholder="Enter surname"
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 bg-white/50 hover:bg-white"
                                        />
                                        {formErrors.surname && <p className="text-red-500 text-sm mt-1">{formErrors.surname[0]}</p>}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-700">Given Name *</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="given_name"
                                            value={formData.given_name}
                                            onChange={handleFormChange}
                                            required
                                            placeholder="Enter given name"
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 bg-white/50 hover:bg-white"
                                        />
                                        {formErrors.given_name && <p className="text-red-500 text-sm mt-1">{formErrors.given_name[0]}</p>}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-700">Middle Name</label>
                                    <input
                                        type="text"
                                        name="middle_name"
                                        value={formData.middle_name}
                                        onChange={handleFormChange}
                                        placeholder="Enter middle name"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 bg-white/50 hover:bg-white"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-700">Birth Date</label>
                                    <input
                                        type="date"
                                        name="birth_date"
                                        value={formData.birth_date}
                                        onChange={handleFormChange}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 bg-white/50 hover:bg-white"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-700">Birth Place</label>
                                    <input
                                        type="text"
                                        name="birth_place"
                                        value={formData.birth_place}
                                        onChange={handleFormChange}
                                        placeholder="Enter birth place"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 bg-white/50 hover:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between pt-4 border-t border-gray-200/50">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                                >
                                    {formLoading ? (
                                        <span className="flex items-center gap-2">
                                            <i className="fas fa-spinner fa-spin"></i>
                                            Saving...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <i className="fas fa-save"></i>
                                            Save Employee
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeList;
