import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { businessManagementAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';

const BusinessDashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [loading, setLoading] = useState(true);
    const [business, setBusiness] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // overview, services, hours
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            showError('Please login to access business management');
            navigate('/login');
            return;
        }
        fetchBusinessData();
    }, [isAuthenticated]);

    const fetchBusinessData = async () => {
        setLoading(true);
        try {
            console.log('Fetching business data...');
            // First, try to get the business
            const businessRes = await businessManagementAPI.getMyBusiness();
            console.log('Business response:', businessRes);

            if (businessRes.data.success && businessRes.data.data) {
                setBusiness(businessRes.data.data);
                console.log('Business set:', businessRes.data.data);

                // Only fetch statistics if business exists
                try {
                    const statsRes = await businessManagementAPI.getStatistics();
                    setStatistics(statsRes.data.data);
                } catch (statsError) {
                    console.error('Error fetching statistics:', statsError);
                    // Don't show error for statistics, just log it
                }
            }
        } catch (error) {
            console.error('Error fetching business:', error);
            if (error.response?.status === 404) {
                // No business found - this is expected for new users
                setBusiness(null);
                setStatistics(null);
            } else if (error.response?.status === 401) {
                console.error('Authentication error:', error);
                showError('Please login to continue');
                navigate('/login');
            } else {
                console.error('Error fetching business data:', error);
                showError('Failed to load business data');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBusiness = async () => {
        setDeleting(true);
        try {
            await businessManagementAPI.deleteBusiness();
            showSuccess('Business deleted successfully');
            setShowDeleteModal(false);
            // Redirect to home page after deletion
            navigate('/');
        } catch (error) {
            console.error('Error deleting business:', error);
            showError(error.response?.data?.message || 'Failed to delete business');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!business) {
        return (
            <div className="max-w-2xl mx-auto">
                <Card className="text-center py-12" padding="lg">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No Business Found</h2>
                    <p className="text-gray-600 mb-6">
                        You haven't set up your business profile yet. Create one to start managing your business.
                    </p>
                    <Button to="/management/edit" variant="primary">
                        Create Business Profile
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                        Business Dashboard
                    </h1>
                    <p className="mt-1 text-base sm:text-lg text-gray-600">
                        Manage your business and services
                    </p>
                </div>
                <Button to="/management/edit" variant="primary">
                    Edit Business
                </Button>
            </div>

            {/* Business Info Card */}
            <Card padding="lg">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {/* Logo */}
                    {business.logo ? (
                        <img 
                            src={business.logo} 
                            alt={business.business_name}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover"
                        />
                    ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-primary-100 flex items-center justify-center">
                            <span className="text-3xl sm:text-4xl font-bold text-primary-600">
                                {business.business_name.charAt(0)}
                            </span>
                        </div>
                    )}
                    
                    {/* Business Details */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                                    {business.business_name}
                                </h2>
                                <p className="text-sm sm:text-base text-gray-500 capitalize">
                                    {business.business_type.replace('_', ' ')}
                                </p>
                            </div>
                            {business.is_verified && (
                                <Badge variant="success">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Verified
                                </Badge>
                            )}
                        </div>
                        
                        <p className="text-sm sm:text-base text-gray-600 mt-2 line-clamp-2">
                            {business.description}
                        </p>

                        {business.city && business.state && (
                            <p className="text-xs sm:text-sm text-gray-500 mt-2">
                                📍 {business.city}, {business.state}
                            </p>
                        )}
                    </div>
                </div>
            </Card>

            {/* Statistics Grid */}
            {statistics && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    <Card padding="lg">
                        <div className="text-center">
                            <p className="text-2xl sm:text-3xl font-bold text-primary-600">
                                {statistics.total_followers}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">Followers</p>
                        </div>
                    </Card>
                    
                    <Card padding="lg">
                        <div className="text-center">
                            <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
                                {statistics?.average_rating ? Number(statistics.average_rating).toFixed(1) : 'N/A'}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">Rating</p>
                        </div>
                    </Card>
                    
                    <Card padding="lg">
                        <div className="text-center">
                            <p className="text-2xl sm:text-3xl font-bold text-green-600">
                                {statistics.total_reviews}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">Reviews</p>
                        </div>
                    </Card>
                    
                    <Card padding="lg">
                        <div className="text-center">
                            <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                                {statistics.total_services}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">Services</p>
                        </div>
                    </Card>
                    
                    <Card padding="lg">
                        <div className="text-center">
                            <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                                {statistics.total_videos}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">Videos</p>
                        </div>
                    </Card>
                    
                    <Card padding="lg">
                        <div className="text-center">
                            <p className="text-2xl sm:text-3xl font-bold text-pink-600">
                                {statistics.total_video_views}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">Video Views</p>
                        </div>
                    </Card>
                    
                    <Card padding="lg">
                        <div className="text-center">
                            <p className="text-2xl sm:text-3xl font-bold text-indigo-600">
                                {statistics.total_bookings}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">Bookings</p>
                        </div>
                    </Card>
                    
                    <Card padding="lg">
                        <div className="text-center">
                            <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                                {statistics.pending_bookings}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">Pending</p>
                        </div>
                    </Card>
                </div>
            )}

            {/* Quick Actions */}
            <Card padding="lg">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <Button to="/management/services" variant="outline" fullWidth>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Manage Services
                    </Button>

                    <Button to="/management/hours" variant="outline" fullWidth>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Business Hours
                    </Button>

                    <Button to="/management/videos" variant="outline" fullWidth>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Upload Video
                    </Button>

                    <Button onClick={() => setShowDeleteModal(true)} variant="outline" fullWidth className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Business
                    </Button>
                </div>
            </Card>

            {/* Recent Services */}
            {business.services && business.services.length > 0 && (
                <Card padding="lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Your Services</h3>
                        <Button to="/management/services" variant="link">
                            View All
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {business.services.slice(0, 5).map((service) => (
                            <div key={service.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                                <div>
                                    <p className="font-medium text-gray-900">{service.name}</p>
                                    <p className="text-xs sm:text-sm text-gray-500">{service.duration} minutes</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">${service.price}</p>
                                    <Badge variant={service.is_active ? 'success' : 'gray'} size="sm">
                                        {service.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-md w-full" padding="lg">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Delete Business</h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-6">
                                Are you sure you want to delete your business? This action cannot be undone.
                                All your business data including services, videos, reviews, and followers will be permanently deleted.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    onClick={() => setShowDeleteModal(false)}
                                    variant="outline"
                                    fullWidth
                                    disabled={deleting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleDeleteBusiness}
                                    variant="primary"
                                    fullWidth
                                    disabled={deleting}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    {deleting ? 'Deleting...' : 'Delete Business'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default BusinessDashboard;
