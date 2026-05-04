import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Pagination from '../components/Pagination.jsx';
import { useToast } from '../components/Toast.jsx';
import EmployeeForm from './EmployeeForm.jsx';

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
    const [editingEmployeeId, setEditingEmployeeId] = useState(null);
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
        const result = await Swal.fire({
            title: 'Delete Employee?',
            text: 'Are you sure you want to delete this employee? This action cannot be undone.',
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
            await axios.delete(`/api/employees/${id}`);
            Swal.fire({
                title: 'Deleted',
                text: 'Employee has been deleted successfully.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#007aff',
                background: '#fff',
                backdrop: 'rgba(0,0,0,0.4)',
                timer: 2000,
                timerProgressBar: true,
                showClass: { popup: 'animate__animated animate__fadeIn' },
                hideClass: { popup: 'animate__animated animate__fadeOut' },
                customClass: {
                    popup: 'ios-alert-popup',
                    title: 'ios-alert-title',
                    confirmButton: 'ios-alert-btn'
                }
            });
            employeesCache.data = null;
            employeesCache.timestamp = 0;
            fetchEmployees(1, search, false);
        } catch (error) {
            if (error.response?.status === 422) {
                Swal.fire({
                    title: 'Cannot Delete',
                    text: error.response.data.message || 'This employee cannot be deleted.',
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
                addToast('Failed to delete employee', 'error');
            }
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
        setEditingEmployeeId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (employee) => {
        setFormData({
            surname: employee.surname,
            given_name: employee.given_name,
            middle_name: employee.middle_name || '',
            birth_date: employee.birth_date || '',
            birth_place: employee.birth_place || ''
        });
        setFormErrors({});
        setEditingEmployeeId(employee.employee_id);
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
            if (editingEmployeeId) {
                await axios.put(`/api/employees/${editingEmployeeId}`, formData);
                addToast('Employee updated successfully', 'success');
            } else {
                await axios.post('/api/employees', formData);
                addToast('Employee created successfully', 'success');
            }
            closeModal();
            fetchEmployees();
        } catch (error) {
            if (error.response?.data?.errors) {
                setFormErrors(error.response.data.errors);
            } else {
                addToast(`Failed to ${editingEmployeeId ? 'update' : 'create'} employee`, 'error');
            }
        }
        setFormLoading(false);
    };

    // Only show skeleton if loading AND no cached employees to display
    if (showSkeleton && employees.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
                
                <div className="flex flex-wrap gap-3 mb-6">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-10 bg-gray-200 rounded w-32 animate-pulse" style={{animationDelay: `${i * 100}ms`}}></div>
                    ))}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white border border-gray-200 rounded-lg p-4" style={{animationDelay: `${i * 100}ms`}}>
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="bg-gray-200 rounded-full w-10 h-10 animate-pulse"></div>
                                <div className="flex-1">
                                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-1 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                                </div>
                            </div>
                            <div className="space-y-2 mb-3">
                                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="flex gap-2">
                                <div className="h-8 bg-gray-200 rounded flex-1 animate-pulse"></div>
                                <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
                                <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
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
                <div>
                    <h1 className="text-2xl font-bold text-[#010066]">Employees</h1>
                    {isRefreshing && (
                        <span className="text-xs text-gray-500 animate-pulse">
                            <i className="fas fa-sync-alt fa-spin mr-1"></i>Updating...
                        </span>
                    )}
                </div>
                <button
                    onClick={openModal}
                    className="bg-[#010066] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    <i className="fas fa-plus mr-2"></i>Add Employee
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <select
                    value={filters.office}
                    onChange={(e) => setFilters({...filters, office: e.target.value})}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#010066] w-48"
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
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#010066] w-48"
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
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#010066] w-48"
                >
                    <option value="">All Status</option>
                    {statuses.map(status => (
                        <option key={status.status_id} value={status.status_id}>
                            {status.status_name}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search employees..."
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 w-48 text-sm focus:outline-none focus:ring-2 focus:ring-[#010066]"
                />
                <button
                    onClick={() => {
                        setSearch('');
                        setFilters({ office: '', position: '', status: '', yearsOfService: '' });
                    }}
                    className="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm w-20"
                >
                    Reset
                </button>
            </div>

            {/* Employee Grid */}
            {filteredEmployees.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
                    <div className="text-gray-400 text-5xl mb-4">
                        <i className="fas fa-users-slash"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-[#010066] mb-2">No employees found</h3>
                    <p className="text-gray-500 mb-4">Get started by adding your first employee</p>
                    <button
                        onClick={openModal}
                        className="bg-[#010066] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Add Employee
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredEmployees.map((employee) => (
                        <div key={employee.employee_id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="bg-[#010066] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                                    {employee.surname.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-[#010066] truncate">
                                        {employee.surname}, {employee.given_name}
                                    </h3>
                                    <p className="text-sm text-gray-500 truncate">{employee.middle_name || ''}</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-3 text-sm">
                                {employee.service_records && employee.service_records.length > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Position:</span>
                                        <span className="font-medium">{employee.service_records[0]?.position?.position_name || '-'}</span>
                                    </div>
                                )}
                                {employee.service_records && employee.service_records.length > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className="font-medium">{employee.service_records[0]?.employment_status?.status_name || '-'}</span>
                                    </div>
                                )}
                                {employee.birth_date && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Birth Date:</span>
                                        <span className="font-medium">{new Date(employee.birth_date).toLocaleDateString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Records:</span>
                                    <span className="font-medium">{employee.service_records_count || 0}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Link
                                    to={`/employees/${employee.employee_id}`}
                                    className="flex-1 text-center bg-[#010066] text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors"
                                >
                                    View
                                </Link>
                                <button
                                    onClick={() => openEditModal(employee)}
                                    className="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 text-sm transition-colors"
                                >
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button
                                    onClick={() => handleDelete(employee.employee_id)}
                                    className="px-3 py-1.5 rounded border border-gray-300 text-gray-600 hover:bg-red-50 hover:text-red-600 text-sm transition-colors"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Pagination data={pagination} onPageChange={(page) => fetchEmployees(page, search)} />

            {/* Employee Modal */}
            <EmployeeForm
                isOpen={isModalOpen}
                onClose={closeModal}
                employeeId={editingEmployeeId}
                onSuccess={() => {
                    fetchEmployees();
                    closeModal();
                }}
            />
        </div>
    );
};

export default EmployeeList;
