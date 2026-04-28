import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Alert from '../components/Alert.jsx';

const EmployeeForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        surname: '',
        given_name: '',
        middle_name: '',
        birth_date: '',
        birth_place: ''
    });
    const [loading, setLoading] = useState(isEdit);
    const [alert, setAlert] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEdit) {
            fetchEmployee();
        }
    }, [id]);

    const fetchEmployee = async () => {
        try {
            const response = await axios.get(`/api/employees/${id}`);
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        try {
            if (isEdit) {
                await axios.put(`/api/employees/${id}`, formData);
            } else {
                await axios.post('/api/employees', formData);
            }
            navigate('/employees');
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setAlert({ message: `Failed to ${isEdit ? 'update' : 'create'} employee`, type: 'error' });
            }
        }
    };

    if (loading) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto">
            <Alert message={alert?.message} type={alert?.type} onClose={() => setAlert(null)} />

            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                {isEdit ? 'Edit Employee' : 'Add New Employee'}
            </h1>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Surname *</label>
                        <input
                            type="text"
                            name="surname"
                            value={formData.surname}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                        <input
                            type="date"
                            name="birth_date"
                            value={formData.birth_date}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Birth Place</label>
                        <input
                            type="text"
                            name="birth_place"
                            value={formData.birth_place}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex justify-between mt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/employees')}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Cancel
                    </button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        {isEdit ? 'Update Employee' : 'Save Employee'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EmployeeForm;
