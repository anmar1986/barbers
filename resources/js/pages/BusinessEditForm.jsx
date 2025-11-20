import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { businessAPI, businessManagementAPI, uploadAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageUpload from '../components/ImageUpload';

const BusinessEditForm = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [isNewBusiness, setIsNewBusiness] = useState(false);
    const [formData, setFormData] = useState({
        business_name: '',
        business_type: 'barber',
        description: '',
        phone: '',
        email: '',
        website: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'USA',
        logo: '',
        cover_image: '',
    });

    const businessTypes = [
        { value: 'barber', label: 'Barber Shop' },
        { value: 'nail_studio', label: 'Nail Studio' },
        { value: 'hair_salon', label: 'Hair Salon' },
        { value: 'massage', label: 'Massage' },
    ];

    useEffect(() => {
        fetchBusiness();
    }, []);

    const fetchBusiness = async () => {
        try {
            const response = await businessManagementAPI.getMyBusiness();
            if (response.data.data) {
                setFormData(response.data.data);
                setIsNewBusiness(false);
            }
        } catch (error) {
            // If 404, it means no business exists yet, so we're creating a new one
            if (error.response?.status === 404) {
                setIsNewBusiness(true);
            } else {
                console.error('Error fetching business:', error);
                showError('Failed to load business details');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogoUpload = async (file) => {
        setUploadingLogo(true);
        try {
            console.log('Uploading logo:', file.name, 'Size:', file.size, 'Type:', file.type);
            const response = await uploadAPI.uploadImage(file, 'businesses/logos', {
                resize_width: 400,
                resize_height: 400,
                create_thumbnail: true
            });
            
            setFormData(prev => ({
                ...prev,
                logo: response.data.data.url
            }));
            
            showSuccess('Logo uploaded successfully');
        } catch (error) {
            console.error('Error uploading logo:', error);
            console.error('Error response:', error.response?.data);
            const errorMsg = error.response?.data?.errors 
                ? Object.values(error.response.data.errors).flat().join(', ')
                : error.response?.data?.message || 'Failed to upload logo';
            showError(errorMsg);
            throw error;
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleCoverUpload = async (file) => {
        setUploadingCover(true);
        try {
            console.log('Uploading cover:', file.name, 'Size:', file.size, 'Type:', file.type);
            const response = await uploadAPI.uploadImage(file, 'businesses/covers', {
                resize_width: 1200,
                resize_height: 400,
                create_thumbnail: false
            });
            
            setFormData(prev => ({
                ...prev,
                cover_image: response.data.data.url
            }));
            
            showSuccess('Cover image uploaded successfully');
        } catch (error) {
            console.error('Error uploading cover image:', error);
            console.error('Error response:', error.response?.data);
            const errorMsg = error.response?.data?.errors 
                ? Object.values(error.response.data.errors).flat().join(', ')
                : error.response?.data?.message || 'Failed to upload cover image';
            showError(errorMsg);
            throw error;
        } finally {
            setUploadingCover(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (isNewBusiness) {
                // Create new business - use the correct endpoint with correct field names
                const response = await businessAPI.create({
                    business_name: formData.business_name,
                    business_type: formData.business_type,
                    description: formData.description,
                    phone: formData.phone,
                    email: formData.email,
                    website: formData.website,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zip_code: formData.zip_code,
                    country: formData.country,
                    logo: formData.logo,
                    cover_image: formData.cover_image,
                });
                showSuccess('Business created successfully');
            } else {
                // Update existing business
                await businessManagementAPI.updateBusiness(formData);
                showSuccess('Business updated successfully');
            }
            navigate('/management');
        } catch (error) {
            console.error('Error saving business:', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || `Failed to ${isNewBusiness ? 'create' : 'update'} business`;
            showError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                    {isNewBusiness ? 'Create Business Profile' : 'Edit Business Profile'}
                </h1>
                <p className="mt-1 text-base sm:text-lg text-gray-600">
                    {isNewBusiness ? 'Set up your business information' : 'Update your business information'}
                </p>
            </div>

            <Card padding="lg">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <Input
                                label="Business Name"
                                name="business_name"
                                value={formData.business_name}
                                onChange={handleChange}
                                autoComplete="organization"
                                required
                            />
                            
                            <Select
                                label="Business Type"
                                name="business_type"
                                value={formData.business_type}
                                onChange={handleChange}
                                options={businessTypes}
                                required
                            />
                        </div>
                        
                        <div className="mt-3 sm:mt-4">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description || ''}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
                                placeholder="Tell customers about your business..."
                            />
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                            Contact Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <Input
                                label="Phone"
                                name="phone"
                                type="tel"
                                value={formData.phone || ''}
                                onChange={handleChange}
                                autoComplete="tel"
                            />
                            
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email || ''}
                                onChange={handleChange}
                                autoComplete="email"
                            />
                            
                            <div className="sm:col-span-2">
                                <Input
                                    label="Website"
                                    name="website"
                                    type="url"
                                    value={formData.website || ''}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                    autoComplete="url"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                            Location
                        </h3>
                        <div className="space-y-3 sm:space-y-4">
                            <Input
                                label="Address"
                                name="address"
                                value={formData.address || ''}
                                onChange={handleChange}
                                autoComplete="street-address"
                            />
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <Input
                                    label="City"
                                    name="city"
                                    value={formData.city || ''}
                                    onChange={handleChange}
                                    autoComplete="address-level2"
                                />
                                
                                <Input
                                    label="State"
                                    name="state"
                                    value={formData.state || ''}
                                    onChange={handleChange}
                                    autoComplete="address-level1"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <Input
                                    label="ZIP Code"
                                    name="zip_code"
                                    value={formData.zip_code || ''}
                                    onChange={handleChange}
                                    autoComplete="postal-code"
                                />
                                
                                <Input
                                    label="Country"
                                    name="country"
                                    value={formData.country || ''}
                                    onChange={handleChange}
                                    autoComplete="country-name"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                            Images
                        </h3>
                        <div className="space-y-4 sm:space-y-6">
                            {/* Logo Upload */}
                            <div>
                                <label htmlFor="logo-upload" className="block text-sm font-medium text-gray-700 mb-2">
                                    Logo
                                </label>
                                {formData.logo && (
                                    <div className="mb-3">
                                        <img 
                                            src={formData.logo} 
                                            alt="Current logo" 
                                            className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Current logo</p>
                                    </div>
                                )}
                                <ImageUpload
                                    id="logo-upload"
                                    onUpload={handleLogoUpload}
                                    maxSize={5}
                                    accept="image/*"
                                    preview={true}
                                    className={uploadingLogo ? 'opacity-50 pointer-events-none' : ''}
                                />
                                {uploadingLogo && (
                                    <p className="text-sm text-primary-600 mt-2">Uploading logo...</p>
                                )}
                            </div>

                            {/* Cover Image Upload */}
                            <div>
                                <label htmlFor="cover-upload" className="block text-sm font-medium text-gray-700 mb-2">
                                    Cover Image
                                </label>
                                {formData.cover_image && (
                                    <div className="mb-3">
                                        <img 
                                            src={formData.cover_image} 
                                            alt="Current cover" 
                                            className="w-full h-32 object-cover rounded-lg border border-gray-300"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Current cover image</p>
                                    </div>
                                )}
                                <ImageUpload
                                    id="cover-upload"
                                    onUpload={handleCoverUpload}
                                    maxSize={5}
                                    accept="image/*"
                                    preview={true}
                                    className={uploadingCover ? 'opacity-50 pointer-events-none' : ''}
                                />
                                {uploadingCover && (
                                    <p className="text-sm text-primary-600 mt-2">Uploading cover image...</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={submitting || uploadingLogo || uploadingCover}
                            fullWidth
                        >
                            {submitting ? 'Saving...' : uploadingLogo || uploadingCover ? 'Uploading images...' : 'Save Changes'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/management')}
                            fullWidth
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default BusinessEditForm;
