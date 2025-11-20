import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { businessAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MediaGallery from '../../components/MediaGallery';

const BusinessDetail = () => {
    const { uuid } = useParams();
    const { isAuthenticated } = useAuth();
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        loadBusiness();
    }, [uuid]);

    const loadBusiness = async () => {
        try {
            setLoading(true);
            const response = await businessAPI.getOne(uuid);
            console.log('Business response:', response.data);

            // Handle Laravel API response structure
            const businessData = response.data.data || response.data;
            setBusiness(businessData);
            setIsFollowing(businessData.is_following || false);
        } catch (err) {
            console.error('Error loading business:', err);
            setError(err.response?.data?.message || 'Failed to load business details');
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        if (!isAuthenticated) {
            alert('Please login to follow businesses');
            return;
        }

        try {
            if (isFollowing) {
                await businessAPI.unfollow(uuid);
            } else {
                await businessAPI.follow(uuid);
            }
            setIsFollowing(!isFollowing);
        } catch (err) {
            console.error('Error following/unfollowing business:', err);
            alert('Failed to update follow status');
        }
    };

    const getRatingStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={i} className="text-yellow-400">★</span>);
        }
        const emptyStars = 5 - fullStars;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<span key={`empty-${i}`} className="text-border">★</span>);
        }
        return stars;
    };

    const formatTime = (time) => {
        if (!time) return 'Closed';
        // Return time in 24-hour format (HH:MM)
        return time.substring(0, 5);
    };

    const daysOfWeek = [
        { value: 0, label: 'Sunday' },
        { value: 1, label: 'Monday' },
        { value: 2, label: 'Tuesday' },
        { value: 3, label: 'Wednesday' },
        { value: 4, label: 'Thursday' },
        { value: 5, label: 'Friday' },
        { value: 6, label: 'Saturday' }
    ];

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="mt-2 text-text-secondary">Loading business...</p>
                </div>
            </div>
        );
    }

    if (error || !business) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="rounded-md bg-error/10 p-4">
                    <p className="text-sm text-error">{error || 'Business not found'}</p>
                </div>
                <Link to="/businesses" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
                    ← Back to businesses
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <Link to="/businesses" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to businesses
            </Link>

            {/* Business Header */}
            <div className="bg-background rounded-lg shadow-md overflow-hidden mb-6">
                {/* Cover Image */}
                <div className="h-64 bg-gradient-to-br from-primary-100 to-primary-200 relative">
                    {business.cover_image ? (
                        <img src={business.cover_image} alt={business.business_name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <svg className="h-24 w-24 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    )}
                    {/* Logo Overlay */}
                    <div className="absolute bottom-0 left-6 transform translate-y-1/2">
                        {business.logo ? (
                            <img
                                src={business.logo}
                                alt={business.business_name}
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-primary-600 border-4 border-white shadow-lg flex items-center justify-center">
                                <span className="text-4xl font-bold text-white">
                                    {business.business_name?.charAt(0) || 'B'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-6 pt-20">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-text-primary mb-2">{business.business_name}</h1>
                            <p className="text-lg text-text-secondary capitalize mb-2">{business.business_type?.replace('_', ' ')}</p>
                            <div className="flex items-center">
                                <div className="flex">{getRatingStars(parseFloat(business.rating) || 0)}</div>
                                <span className="ml-2 text-text-secondary">{parseFloat(business.rating || 0).toFixed(1)}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleFollow}
                            className={`px-6 py-2 rounded-md font-medium ${
                                isFollowing
                                    ? 'bg-gray-200 text-text-primary hover:bg-gray-300'
                                    : 'bg-primary-600 text-background hover:bg-primary-700'
                            }`}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    </div>
                    {business.description && (
                        <p className="text-text-primary mb-4">{business.description}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Services */}
                    {business.services && business.services.length > 0 && (
                        <div className="bg-background rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-text-primary mb-4">Services</h2>
                            <div className="space-y-4">
                                {business.services.map((service) => (
                                    <div key={service.uuid} className="border-b border-border pb-4 last:border-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-text-primary">{service.name}</h3>
                                                {service.description && (
                                                    <p className="text-sm text-text-secondary mt-1">{service.description}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-primary-600">${service.price}</p>
                                                {service.duration && (
                                                    <p className="text-sm text-text-secondary">{service.duration} min</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Portfolio Gallery */}
                    {business.gallery && business.gallery.length > 0 && (
                        <div className="bg-background rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-text-primary mb-4">Portfolio</h2>
                            <MediaGallery items={business.gallery} />
                        </div>
                    )}

                    {/* Reviews */}
                    {business.reviews && business.reviews.length > 0 && (
                        <div className="bg-background rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-text-primary mb-4">Reviews</h2>
                            <div className="space-y-4">
                                {business.reviews.map((review) => (
                                    <div key={review.uuid} className="border-b border-border pb-4 last:border-0">
                                        <div className="flex items-center mb-2">
                                            <div className="flex">{getRatingStars(review.rating)}</div>
                                            <span className="ml-2 text-sm text-text-secondary">{review.user_name}</span>
                                        </div>
                                        <p className="text-text-primary">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Contact Info */}
                    <div className="bg-background rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-text-primary mb-4">Contact</h2>
                        <div className="space-y-3">
                            {business.phone && (
                                <div className="flex items-start">
                                    <svg className="h-5 w-5 text-text-secondary mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span className="text-text-primary">{business.phone}</span>
                                </div>
                            )}
                            {business.email && (
                                <div className="flex items-start">
                                    <svg className="h-5 w-5 text-text-secondary mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-text-primary">{business.email}</span>
                                </div>
                            )}
                            {business.location && (
                                <div className="flex items-start">
                                    <svg className="h-5 w-5 text-text-secondary mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    <span className="text-text-primary">{business.location}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Business Hours */}
                    {business.hours && business.hours.length > 0 && (
                        <div className="bg-background rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-text-primary mb-4">Hours</h2>
                            <div className="space-y-2">
                                {daysOfWeek.map((day) => {
                                    const hours = business.hours.find(h => h.day_of_week === day.value);
                                    return (
                                        <div key={day.value} className="flex justify-between text-sm">
                                            <span className="font-medium text-text-primary">{day.label}</span>
                                            <span className="text-text-secondary">
                                                {hours && !hours.is_closed
                                                    ? `${formatTime(hours.open_time)} - ${formatTime(hours.close_time)}`
                                                    : 'Closed'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BusinessDetail;
