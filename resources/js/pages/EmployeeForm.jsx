import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Alert from '../components/Alert.jsx';
import Swal from 'sweetalert2';

const EmployeeForm = ({ isOpen, onClose, employeeId, onSuccess }) => {
    const isEdit = Boolean(employeeId);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        surname: '',
        given_name: '',
        middle_name: '',
        birth_date: '',
        birth_place: ''
    });
    const [loading, setLoading] = useState(isEdit);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alert, setAlert] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEdit && employeeId) {
            fetchEmployee();
        }
    }, [employeeId]);

    const fetchEmployee = async () => {
        try {
            const response = await axios.get(`/api/employees/${employeeId}`);
            const emp = response.data;
            setFormData({
                surname: emp.surname,
                given_name: emp.given_name,
                middle_name: emp.middle_name || '',
                birth_date: emp.birth_date || '',
                birth_place: emp.birth_place || ''
            });
        } catch (error) {
            setAlert({ message: 'Failed to load employee', type: 'error' });
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: null });
        
        // Validate age if birth_date is being changed
        if (e.target.name === 'birth_date' && e.target.value) {
            const birthDate = new Date(e.target.value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const dayDiff = today.getDate() - birthDate.getDate();
            
            // Adjust age if birthday hasn't occurred yet this year
            const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
            
            if (actualAge < 18) {
                setErrors({ 
                    ...errors, 
                    birth_date: ['Employee must be at least 18 years old. Current age: ' + actualAge + ' years.'] 
                });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        try {
            let response;
            if (isEdit) {
                response = await axios.put(`/api/employees/${employeeId}`, formData);
            } else {
                response = await axios.post('/api/employees', formData);
            }

            // Show iOS-style success confirmation
            await Swal.fire({
                icon: false,
                title: false,
                html: `
                    <div class="flex items-center gap-3">
                        <div class="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <div class="font-semibold text-gray-900">${isEdit ? 'Successfully Updated Employee Informations' : 'Successfully Created Employee Profile'}!</div>
                            <div class="text-sm text-gray-600">${formData.surname}, ${formData.given_name}</div>
                        </div>
                    </div>
                `,
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
                position: 'top-end',
                toast: true,
                width: '320px',
                padding: '16px',
                background: '#ffffff',
                customClass: {
                    popup: 'ios-toast',
                    container: 'ios-toast-container'
                },
                showClass: {
                    popup: 'animate__animated animate__slideInRight'
                },
                hideClass: {
                    popup: 'animate__animated animate__slideOutRight'
                }
            });

            // Clear form fields if it's a new employee (not edit mode)
            if (!isEdit) {
                setFormData({
                    surname: '',
                    given_name: '',
                    middle_name: '',
                    birth_date: '',
                    birth_place: ''
                });
                setErrors({});
            }

            onSuccess && onSuccess();
            onClose();
        } catch (error) {
            // Close loading dialog
            Swal.close();
            
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                
                // Show validation error summary
                const errorMessages = Object.values(error.response.data.errors).flat();
                await Swal.fire({
                    icon: false,
                    title: false,
                    html: `
                        <div class="flex flex-col items-center text-center">
                            <div class="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <div class="mb-3">
                                <div class="text-lg font-semibold text-gray-900">Validation Error</div>
                            </div>
                            <div class="text-left text-sm text-gray-600 max-w-xs">
                                <p class="mb-2">Please fix the following errors:</p>
                                <ul class="text-red-600 list-disc list-inside space-y-1">
                                    ${errorMessages.map(msg => `<li>${msg}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    `,
                    confirmButtonColor: '#010066',
                    confirmButtonText: 'Fix Issues',
                    customClass: {
                        popup: 'ios-validation-error',
                        container: 'ios-validation-error-container'
                    }
                });
            } else {
                setAlert({ message: `Failed to ${isEdit ? 'update' : 'create'} employee`, type: 'error' });
                
                await Swal.fire({
                    icon: false,
                    title: false,
                    html: `
                        <div class="flex flex-col items-center text-center">
                            <div class="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <div class="mb-3">
                                <div class="text-lg font-semibold text-gray-900">Something Went Wrong</div>
                            </div>
                            <div class="text-sm text-gray-600 max-w-xs">
                                Failed to ${isEdit ? 'update' : 'create'} employee. Please try again.
                            </div>
                        </div>
                    `,
                    confirmButtonColor: '#010066',
                    confirmButtonText: 'Try Again',
                    customClass: {
                        popup: 'ios-general-error',
                        container: 'ios-general-error-container'
                    }
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full z-10 border border-gray-200/50">
                <div className="flex justify-between items-center p-6 border-b border-gray-200/50">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {isEdit ? 'Edit Employee' : 'Add New Employee'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        <i className="fas fa-times text-gray-600 text-sm"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                    {alert?.message && (
                        <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />
                    )}

                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Surname *</label>
                            <input
                                type="text"
                                name="surname"
                                value={formData.surname}
                                onChange={handleChange}
                                required
                                placeholder="Enter surname"
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#010066] focus:border-transparent"
                            />
                            {errors.surname && <p className="text-red-500 text-sm mt-1">{errors.surname[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Given Name *</label>
                            <input
                                type="text"
                                name="given_name"
                                value={formData.given_name}
                                onChange={handleChange}
                                required
                                placeholder="Enter given name"
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#010066] focus:border-transparent"
                            />
                            {errors.given_name && <p className="text-red-500 text-sm mt-1">{errors.given_name[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                            <input
                                type="text"
                                name="middle_name"
                                value={formData.middle_name}
                                onChange={handleChange}
                                placeholder="Enter middle name"
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#010066] focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                            <input
                                type="date"
                                name="birth_date"
                                value={formData.birth_date}
                                onChange={handleChange}
                                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#010066] focus:border-transparent"
                            />
                            {errors.birth_date && <p className="text-red-500 text-sm mt-1">{errors.birth_date[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Birth Place</label>
                            <input
                                type="text"
                                name="birth_place"
                                value={formData.birth_place}
                                onChange={handleChange}
                                placeholder="Enter birth place"
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#010066] focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between gap-3 pt-6 border-t border-gray-200/50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`px-6 py-3 rounded-2xl transition-all duration-300 text-sm font-semibold flex items-center gap-2 ${
                                isSubmitting 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-[#010066] to-[#000088] text-white shadow-lg hover:shadow-xl hover:from-[#000055] hover:to-[#000099]'
                            }`}
                        >
                            {isSubmitting && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            )}
                            {isSubmitting ? 'Saving...' : (isEdit ? 'Update Employee' : 'Save Employee')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeForm;
