import React, { useState, useEffect, useRef } from 'react';
import { businessManagementAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { getServiceSuggestions, filterSuggestions } from '../constants/serviceSuggestions';

const ServiceManagement = () => {
    const { showSuccess, showError } = useToast();
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState([]);
    const [business, setBusiness] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration: '',
        is_active: true,
    });
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const suggestionsRef = useRef(null);

    useEffect(() => {
        fetchBusinessAndServices();
    }, []);

    useEffect(() => {
        // Close suggestions when clicking outside
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchBusinessAndServices = async () => {
        try {
            // Fetch business info to get business type
            const businessRes = await businessManagementAPI.getMyBusiness();
            if (businessRes.data.success && businessRes.data.data) {
                setBusiness(businessRes.data.data);
            }

            // Fetch services
            const response = await businessManagementAPI.getServices();
            setServices(response.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            showError('Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await businessManagementAPI.getServices();
            setServices(response.data.data);
        } catch (error) {
            console.error('Error fetching services:', error);
            showError('Failed to load services');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Show autocomplete suggestions for service name
        if (name === 'name' && business) {
            const allSuggestions = getServiceSuggestions(business.business_type);
            const filtered = filterSuggestions(allSuggestions, value);
            setFilteredSuggestions(filtered);
            setShowSuggestions(value.length > 0 && filtered.length > 0);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setFormData(prev => ({
            ...prev,
            name: suggestion
        }));
        setShowSuggestions(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingService) {
                await businessManagementAPI.updateService(editingService.uuid, formData);
                showSuccess('Service updated successfully');
            } else {
                await businessManagementAPI.createService(formData);
                showSuccess('Service created successfully');
            }

            resetForm();
            fetchServices();
        } catch (error) {
            console.error('Error saving service:', error);
            showError(error.response?.data?.message || 'Failed to save service');
        }
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            description: service.description || '',
            price: service.price,
            duration: service.duration_minutes || service.duration || '',
            is_active: service.is_available ?? service.is_active ?? true,
        });
        setShowForm(true);
    };

    const handleDelete = async (uuid) => {
        if (!confirm('Are you sure you want to delete this service?')) return;

        try {
            await businessManagementAPI.deleteService(uuid);
            showSuccess('Service deleted successfully');
            fetchServices();
        } catch (error) {
            console.error('Error deleting service:', error);
            showError('Failed to delete service');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            duration: '',
            is_active: true,
        });
        setEditingService(null);
        setShowForm(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                        Service Management
                    </h1>
                    <p className="mt-1 text-base sm:text-lg text-gray-600">
                        Manage your services and pricing
                    </p>
                </div>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)} variant="primary">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Service
                    </Button>
                )}
            </div>

            {/* Service Form */}
            {showForm && (
                <Card padding="lg">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                        {editingService ? 'Edit Service' : 'New Service'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {/* Service Name with Autocomplete */}
                            <div className="relative" ref={suggestionsRef}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Service Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    onFocus={() => {
                                        if (formData.name && business) {
                                            const allSuggestions = getServiceSuggestions(business.business_type);
                                            const filtered = filterSuggestions(allSuggestions, formData.name);
                                            setFilteredSuggestions(filtered);
                                            setShowSuggestions(filtered.length > 0);
                                        }
                                    }}
                                    required
                                    placeholder="Start typing to see suggestions..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
                                    autoComplete="off"
                                />

                                {/* Autocomplete Suggestions */}
                                {showSuggestions && filteredSuggestions.length > 0 && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                                        {filteredSuggestions.slice(0, 10).map((suggestion, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="w-full text-left px-3 py-2 hover:bg-primary-50 hover:text-primary-700 text-sm sm:text-base border-b border-gray-100 last:border-0 transition-colors"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Input
                                label="Price ($)"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                placeholder="0.00"
                            />
                        </div>

                        <Input
                            label="Duration (minutes)"
                            name="duration"
                            type="number"
                            min="1"
                            value={formData.duration}
                            onChange={handleChange}
                            required
                            placeholder="30"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
                                placeholder="Service description..."
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="is_active"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                                Service is active and available for booking
                            </label>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button type="submit" variant="primary" fullWidth>
                                {editingService ? 'Update Service' : 'Create Service'}
                            </Button>
                            <Button type="button" variant="outline" onClick={resetForm} fullWidth>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Services List */}
            {services.length === 0 ? (
                <Card className="text-center py-12" padding="lg">
                    <p className="text-gray-500 text-lg">No services found</p>
                    <p className="text-gray-400 mt-2">Create your first service to get started</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {services.map((service) => (
                        <Card key={service.id} padding="lg">
                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                                                {service.name}
                                            </h3>
                                            <Badge variant={service.is_active ? 'success' : 'gray'} size="sm" className="mt-1">
                                                {service.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    {service.description && (
                                        <p className="text-sm sm:text-base text-gray-600 mb-2">
                                            {service.description}
                                        </p>
                                    )}
                                    
                                    <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500">
                                        <span className="font-semibold text-lg text-primary-600">
                                            ${parseFloat(service.price).toFixed(2)}
                                        </span>
                                        <span>⏱️ {service.duration_minutes || service.duration} minutes</span>
                                    </div>
                                </div>
                                
                                <div className="flex sm:flex-col gap-2">
                                    <Button
                                        onClick={() => handleEdit(service)}
                                        variant="outline"
                                        size="sm"
                                        fullWidth
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(service.uuid)}
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 hover:bg-red-50"
                                        fullWidth
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ServiceManagement;
