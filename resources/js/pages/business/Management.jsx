import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Management = () => {
    const { user } = useAuth();
    const [business, setBusiness] = useState(null);
    const [videos, setVideos] = useState([]);
    const [stats, setStats] = useState({
        totalViews: 0,
        totalLikes: 0,
        totalFollowers: 0,
        totalVideos: 0
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (user?.user_type === 'business_owner') {
            loadDashboardData();
        }
    }, [user]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Load business info using my-business endpoint
            const businessResponse = await api.get('/my-business');

            if (businessResponse.data.success && businessResponse.data.data) {
                const userBusiness = businessResponse.data.data;
                setBusiness(userBusiness);

                console.log('Business loaded:', userBusiness);

                // Load videos using my-business/videos endpoint
                const videosResponse = await api.get('/my-business/videos');

                if (videosResponse.data.success) {
                    const businessVideos = videosResponse.data.data || [];
                    setVideos(businessVideos);

                    console.log('Videos loaded:', businessVideos);

                    // Calculate stats
                    const totalViews = businessVideos.reduce((sum, v) => sum + (v.view_count || 0), 0);
                    const totalLikes = businessVideos.reduce((sum, v) => sum + (v.like_count || 0), 0);

                    setStats({
                        totalViews,
                        totalLikes,
                        totalFollowers: userBusiness.follower_count || 0,
                        totalVideos: businessVideos.length
                    });
                }
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            console.error('Error response:', error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    if (user?.user_type !== 'business_owner') {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-warning bg-opacity-10 border border-warning rounded-lg p-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Access Only</h2>
                    <p className="text-gray-600 mb-4">This page is only available for business owners.</p>
                    <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">
                        Go to Home
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="mt-2 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!business) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-info bg-opacity-10 border border-info rounded-lg p-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Business Found</h2>
                    <p className="text-gray-600 mb-4">You haven't created a business profile yet.</p>
                    <button className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                        Create Business Profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
                <p className="mt-2 text-gray-600">{business.business_name}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Views</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalViews.toLocaleString()}</p>
                        </div>
                        <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                            <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Likes</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalLikes.toLocaleString()}</p>
                        </div>
                        <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Followers</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalFollowers.toLocaleString()}</p>
                        </div>
                        <div className="h-12 w-12 bg-secondary-100 rounded-full flex items-center justify-center">
                            <svg className="h-6 w-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Videos</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalVideos}</p>
                        </div>
                        <div className="h-12 w-12 bg-accent-100 rounded-full flex items-center justify-center">
                            <svg className="h-6 w-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-8">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 ${
                                activeTab === 'overview'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                            }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('videos')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 ${
                                activeTab === 'videos'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                            }`}
                        >
                            Videos ({videos.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('services')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 ${
                                activeTab === 'services'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                            }`}
                        >
                            Services
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 ${
                                activeTab === 'reviews'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                            }`}
                        >
                            Reviews
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Link
                                    to="/videos/upload"
                                    className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
                                >
                                    <div className="text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        <p className="mt-2 text-sm font-medium text-gray-900">Upload Video</p>
                                    </div>
                                </Link>

                                <Link
                                    to="/business/edit"
                                    className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
                                >
                                    <div className="text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <p className="mt-2 text-sm font-medium text-gray-900">Edit Business</p>
                                    </div>
                                </Link>

                                <button className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors">
                                    <div className="text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <p className="mt-2 text-sm font-medium text-gray-900">View Analytics</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'videos' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Your Videos</h3>
                                <Link
                                    to="/videos/upload"
                                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                                >
                                    Upload New Video
                                </Link>
                            </div>

                            {videos.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <p className="mt-2 text-gray-600">No videos uploaded yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {videos.map((video) => (
                                        <div key={video.uuid} className="bg-gray-50 rounded-lg overflow-hidden">
                                            <div className="aspect-[9/16] bg-gray-200 relative">
                                                {video.thumbnail_url && (
                                                    <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h4 className="font-medium text-gray-900 mb-2">{video.title}</h4>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span>{video.view_count || 0} views</span>
                                                    <span>{video.like_count || 0} likes</span>
                                                    <span>{video.comment_count || 0} comments</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Services</h3>
                                <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                                    Add Service
                                </button>
                            </div>
                            <div className="space-y-4">
                                {business.services?.map((service) => (
                                    <div key={service.uuid} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{service.name}</h4>
                                            <p className="text-sm text-gray-600">{service.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">${service.price}</p>
                                            <p className="text-sm text-gray-600">{service.duration} min</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Reviews</h3>
                            <div className="text-center py-12 text-gray-600">
                                Reviews will appear here
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Management;
