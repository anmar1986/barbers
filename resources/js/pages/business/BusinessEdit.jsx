import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { businessAPI, uploadAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const BusinessEdit = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        business_name: '',
        business_type: 'barber',
        description: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        phone: '',
        email: '',
        website: ''
    });

    const [businessHours, setBusinessHours] = useState([
        { day: 0, day_name: 'Sunday', open_time: '09:00', close_time: '17:00', is_closed: false },
        { day: 1, day_name: 'Monday', open_time: '09:00', close_time: '17:00', is_closed: false },
        { day: 2, day_name: 'Tuesday', open_time: '09:00', close_time: '17:00', is_closed: false },
        { day: 3, day_name: 'Wednesday', open_time: '09:00', close_time: '17:00', is_closed: false },
        { day: 4, day_name: 'Thursday', open_time: '09:00', close_time: '17:00', is_closed: false },
        { day: 5, day_name: 'Friday', open_time: '09:00', close_time: '17:00', is_closed: false },
        { day: 6, day_name: 'Saturday', open_time: '09:00', close_time: '17:00', is_closed: false }
    ]);

    const [coverImage, setCoverImage] = useState(null);
    const [logoImage, setLogoImage] = useState(null);
    const [coverPreview, setCoverPreview] = useState('');
    const [logoPreview, setLogoPreview] = useState('');

    useEffect(() => {
        if (user?.user_type !== 'business_owner') {
            navigate('/');
            return;
        }
        loadBusiness();
    }, [user]);

    const loadBusiness = async () => {
        setLoading(true);
        try {
            const response = await businessAPI.getAll({ owner: user.uuid });
            if (response.data.data && response.data.data.length > 0) {
                const businessData = response.data.data[0];
                setBusiness(businessData);

                // Populate form
                setFormData({
                    business_name: businessData.business_name || '',
                    business_type: businessData.business_type || 'barber',
                    description: businessData.description || '',
                    address: businessData.address || '',
                    city: businessData.city || '',
                    state: businessData.state || '',
                    postal_code: businessData.postal_code || '',
                    phone: businessData.phone || '',
                    email: businessData.email || '',
                    website: businessData.website || ''
                });

                // Set cover and logo
                if (businessData.cover_image) {
                    setCoverPreview(businessData.cover_image);
                }
                if (businessData.logo) {
                    setLogoPreview(businessData.logo);
                }

                // Populate business hours if available
                if (businessData.hours && businessData.hours.length > 0) {
                    const hoursMap = businessHours.map(defaultHour => {
                        const existingHour = businessData.hours.find(h => h.day_of_week === defaultHour.day);
                        if (existingHour) {
                            return {
                                ...defaultHour,
                                open_time: existingHour.open_time || defaultHour.open_time,
                                close_time: existingHour.close_time || defaultHour.close_time,
                                is_closed: existingHour.is_closed || false
                            };
                        }
                        return defaultHour;
                    });
                    setBusinessHours(hoursMap);
                }
            }
        } catch (err) {
            setErrors({ general: 'Failed to load business information' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const handleHourChange = (dayIndex, field, value) => {
        const updatedHours = [...businessHours];
        updatedHours[dayIndex][field] = value;
        setBusinessHours(updatedHours);
    };

    const handleImageChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setErrors({ ...errors, [type]: 'Please select a valid image file' });
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setErrors({ ...errors, [type]: 'Image size must be less than 5MB' });
                return;
            }

            if (type === 'cover') {
                setCoverImage(file);
                setCoverPreview(URL.createObjectURL(file));
            } else {
                setLogoImage(file);
                setLogoPreview(URL.createObjectURL(file));
            }

            setErrors({ ...errors, [type]: null });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.business_name.trim()) {
            newErrors.business_name = 'Business name is required';
        }

        if (!formData.business_type) {
            newErrors.business_type = 'Business type is required';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!business) {
            // Create new business
            if (!validateForm()) return;
        }

        setSaving(true);
        setErrors({});
        setSuccessMessage('');

        try {
            let businessData = { ...formData };

            // Upload cover image if changed
            if (coverImage) {
                const coverResponse = await uploadAPI.uploadImage(coverImage, 'businesses', {
                    resize_width: 1200,
                    resize_height: 400
                });
                businessData.cover_image = coverResponse.data.data?.url || coverResponse.data.url;
            }

            // Upload logo if changed
            if (logoImage) {
                const logoResponse = await uploadAPI.uploadImage(logoImage, 'businesses', {
                    resize_width: 300,
                    resize_height: 300
                });
                businessData.logo = logoResponse.data.data?.url || logoResponse.data.url;
            }

            if (business) {
                // Update existing business
                await businessAPI.update(business.uuid, businessData);

                // Update business hours
                const hoursData = businessHours.map(hour => ({
                    day_of_week: hour.day,
                    open_time: hour.is_closed ? null : hour.open_time,
                    close_time: hour.is_closed ? null : hour.close_time,
                    is_closed: hour.is_closed
                }));

                await businessAPI.updateHours(business.uuid, { hours: hoursData });

                setSuccessMessage('Business profile updated successfully!');
            } else {
                // Create new business
                await businessAPI.create(businessData);
                setSuccessMessage('Business profile created successfully!');
            }

            // Reload business data
            setTimeout(() => {
                loadBusiness();
                window.scrollTo(0, 0);
            }, 1000);

        } catch (err) {
            console.error('Save error:', err);
            setErrors({
                general: err.response?.data?.message || 'Failed to save business profile'
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="mt-2 text-text-secondary">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary">
                    {business ? 'Edit Business Profile' : 'Create Business Profile'}
                </h1>
                <p className="mt-2 text-text-secondary">
                    {business ? 'Update your business information' : 'Set up your business profile to start sharing'}
                </p>
            </div>

            {successMessage && (
                <div className="mb-6 rounded-md bg-success/10 border border-success p-4">
                    <p className="text-sm text-success">{successMessage}</p>
                </div>
            )}

            {errors.general && (
                <div className="mb-6 rounded-md bg-error/10 border border-error p-4">
                    <p className="text-sm text-error">{errors.general}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-background rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-text-primary mb-6">Basic Information</h2>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="business_name" className="block text-sm font-medium text-text-primary mb-2">
                                Business Name *
                            </label>
                            <input
                                id="business_name"
                                type="text"
                                name="business_name"
                                value={formData.business_name}
                                onChange={handleInputChange}
                                disabled={saving}
                                autoComplete="organization"
                                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                                required
                            />
                            {errors.business_name && (
                                <p className="mt-1 text-sm text-error">{errors.business_name}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="business_type" className="block text-sm font-medium text-text-primary mb-2">
                                Business Type *
                            </label>
                            <select
                                id="business_type"
                                name="business_type"
                                value={formData.business_type}
                                onChange={handleInputChange}
                                disabled={saving}
                                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                                required
                            >
                                <option value="barber">Barber Shop</option>
                                <option value="nail_studio">Nail Studio</option>
                                <option value="hair_salon">Hair Salon</option>
                                <option value="massage">Massage Center</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                disabled={saving}
                                rows="4"
                                placeholder="Tell customers about your business..."
                                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-background rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-text-primary mb-6">Contact Information</h2>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-2">
                                    Phone *
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                    autoComplete="tel"
                                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                                    required
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-error">{errors.phone}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                    autoComplete="email"
                                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="website" className="block text-sm font-medium text-text-primary mb-2">
                                Website
                            </label>
                            <input
                                id="website"
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleInputChange}
                                disabled={saving}
                                autoComplete="url"
                                placeholder="https://www.example.com"
                                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                            />
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-text-primary mb-2">
                                Address
                            </label>
                            <input
                                id="address"
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                disabled={saving}
                                autoComplete="street-address"
                                placeholder="Street address"
                                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-text-primary mb-2">
                                    City
                                </label>
                                <input
                                    id="city"
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                    autoComplete="address-level2"
                                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                                />
                            </div>

                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-text-primary mb-2">
                                    State
                                </label>
                                <input
                                    id="state"
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                    autoComplete="address-level1"
                                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                                />
                            </div>

                            <div>
                                <label htmlFor="postal_code" className="block text-sm font-medium text-text-primary mb-2">
                                    ZIP Code
                                </label>
                                <input
                                    id="postal_code"
                                    type="text"
                                    name="postal_code"
                                    value={formData.postal_code}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                    autoComplete="postal-code"
                                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Business Hours */}
                <div className="bg-background rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-text-primary mb-6">Business Hours</h2>

                    <div className="space-y-3">
                        {businessHours.map((hour, index) => (
                            <div key={hour.day} className="flex items-center gap-4">
                                <div className="w-28">
                                    <span className="font-medium text-text-primary">{hour.day_name}</span>
                                </div>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={hour.is_closed}
                                        onChange={(e) => handleHourChange(index, 'is_closed', e.target.checked)}
                                        disabled={saving}
                                        className="rounded text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="ml-2 text-sm text-text-secondary">Closed</span>
                                </label>

                                {!hour.is_closed && (
                                    <>
                                        <input
                                            type="time"
                                            value={hour.open_time}
                                            onChange={(e) => handleHourChange(index, 'open_time', e.target.value)}
                                            disabled={saving}
                                            className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                                        />
                                        <span className="text-text-secondary">to</span>
                                        <input
                                            type="time"
                                            value={hour.close_time}
                                            onChange={(e) => handleHourChange(index, 'close_time', e.target.value)}
                                            disabled={saving}
                                            className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                                        />
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Images */}
                <div className="bg-background rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-text-primary mb-6">Images</h2>

                    <div className="space-y-6">
                        {/* Cover Image */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Cover Image
                            </label>
                            {coverPreview ? (
                                <div className="relative">
                                    <img
                                        src={coverPreview}
                                        alt="Cover"
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCoverImage(null);
                                            setCoverPreview('');
                                        }}
                                        disabled={saving}
                                        className="absolute top-2 right-2 p-2 bg-error text-white rounded-full hover:bg-error/80 disabled:opacity-50"
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                                    <label className="cursor-pointer">
                                        <span className="text-sm font-medium text-primary-600">Upload cover image</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e, 'cover')}
                                            disabled={saving}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Logo */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Logo
                            </label>
                            {logoPreview ? (
                                <div className="relative inline-block">
                                    <img
                                        src={logoPreview}
                                        alt="Logo"
                                        className="w-32 h-32 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLogoImage(null);
                                            setLogoPreview('');
                                        }}
                                        disabled={saving}
                                        className="absolute top-1 right-1 p-1 bg-error text-white rounded-full hover:bg-error/80 disabled:opacity-50"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center w-32">
                                    <label className="cursor-pointer">
                                        <span className="text-sm font-medium text-primary-600">Upload logo</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e, 'logo')}
                                            disabled={saving}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/management')}
                        disabled={saving}
                        className="flex-1 px-6 py-3 border-2 border-border text-text-primary font-semibold rounded-md hover:bg-surface disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 px-6 py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : business ? 'Update Profile' : 'Create Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BusinessEdit;
