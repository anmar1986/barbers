import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Container from '../components/Container';
import Button from '../components/Button';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const Home = () => {
    const { isAuthenticated, user } = useAuth();
    const [featuredBusinesses, setFeaturedBusinesses] = useState([]);
    const [trendingVideos, setTrendingVideos] = useState([]);
    const [popularProducts, setPopularProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHomeData();
    }, []);

    const fetchHomeData = async () => {
        try {
            setLoading(true);
            const [businesses, videos, products] = await Promise.all([
                api.get('/businesses?limit=6&sort=rating'),
                api.get('/videos?limit=6&filter=trending'),
                api.get('/products?limit=6&sort=popular'),
            ]);

            setFeaturedBusinesses(businesses.data.data || []);
            setTrendingVideos(videos.data.data || []);
            setPopularProducts(products.data.data || []);
        } catch (error) {
            console.error('Error fetching home data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }}></div>
                </div>

                <Container className="relative py-24 lg:py-32">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
                        <div className="lg:col-span-7">
                            <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl lg:text-7xl">
                                <span className="block">Discover Beauty</span>
                                <span className="block text-accent-400">Professionals Near You</span>
                            </h1>
                            <p className="mt-6 max-w-2xl text-xl text-primary-100">
                                Connect with top-rated barbers, salons, and beauty experts. Watch tutorials, book services, and shop professional products.
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row gap-4">
                                <Button to="/videos" size="lg" className="bg-white text-primary-700 hover:bg-primary-50">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                    </svg>
                                    Watch Videos
                                </Button>
                                <Button to="/businesses" variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                                    Explore Businesses
                                </Button>
                            </div>
                        </div>

                        <div className="mt-12 lg:mt-0 lg:col-span-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-accent-500 rounded-full p-3">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-bold text-white">10K+</h3>
                                            <p className="text-primary-100">Video Tutorials</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                    <h3 className="text-2xl font-bold text-white">5K+</h3>
                                    <p className="text-primary-100 text-sm">Professionals</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                    <h3 className="text-2xl font-bold text-white">50K+</h3>
                                    <p className="text-primary-100 text-sm">Happy Clients</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Features Section */}
            <div className="py-20 bg-gray-50">
                <Container>
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Everything You Need in One Place
                        </h2>
                        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                            From discovery to booking, we've got you covered
                        </p>
                    </div>

                    <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />,
                                color: 'primary',
                                title: 'Video Tutorials',
                                description: 'Watch TikTok-style tutorials from top professionals'
                            },
                            {
                                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
                                color: 'secondary',
                                title: 'Find Businesses',
                                description: 'Discover top-rated beauty professionals near you'
                            },
                            {
                                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />,
                                color: 'accent',
                                title: 'Shop Products',
                                description: 'Buy professional beauty products and tools'
                            },
                            {
                                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
                                color: 'success',
                                title: 'Book Services',
                                description: 'Schedule appointments with verified professionals'
                            }
                        ].map((feature, index) => (
                            <Card key={index} padding="lg" hover className="text-center">
                                <div className={`flex items-center justify-center h-16 w-16 rounded-xl bg-${feature.color}-100 mx-auto`}>
                                    <svg className={`h-8 w-8 text-${feature.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {feature.icon}
                                    </svg>
                                </div>
                                <h3 className="mt-6 text-xl font-semibold text-gray-900">{feature.title}</h3>
                                <p className="mt-2 text-base text-gray-600">{feature.description}</p>
                            </Card>
                        ))}
                    </div>
                </Container>
            </div>

            {/* Featured Businesses Section */}
            {featuredBusinesses.length > 0 && (
                <div className="py-20 bg-white">
                    <Container>
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">Top-Rated Businesses</h2>
                                <p className="mt-2 text-gray-600">Discover the best beauty professionals</p>
                            </div>
                            <Button to="/businesses" variant="outline">
                                View All
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredBusinesses.map((business) => (
                                <Link key={business.id} to={`/businesses/${business.uuid}`}>
                                    <Card hover className="h-full">
                                        <img
                                            src={business.cover_image || '/images/default-business.jpg'}
                                            alt={business.business_name}
                                            className="w-full h-48 object-cover rounded-t-lg"
                                        />
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold text-gray-900">{business.business_name}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{business.business_type}</p>
                                            <div className="flex items-center mt-2">
                                                <div className="flex text-accent-500">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg key={i} className="w-4 h-4" fill={i < Math.floor(business.average_rating || 0) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                                <span className="ml-2 text-sm text-gray-600">({business.total_reviews || 0})</span>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </Container>
                </div>
            )}

            {/* Trending Videos Section */}
            {trendingVideos.length > 0 && (
                <div className="py-20 bg-gray-50">
                    <Container>
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">Trending Videos</h2>
                                <p className="mt-2 text-gray-600">Watch what's popular right now</p>
                            </div>
                            <Button to="/videos" variant="outline">
                                View All
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {trendingVideos.map((video) => (
                                <Link key={video.id} to={`/videos/${video.uuid}`}>
                                    <div className="group cursor-pointer">
                                        <div className="relative aspect-[9/16] bg-gray-200 rounded-lg overflow-hidden">
                                            <img
                                                src={video.thumbnail_url || '/images/default-video.jpg'}
                                                alt={video.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                                                <svg className="w-12 h-12 text-white opacity-80" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                                </svg>
                                            </div>
                                            <div className="absolute bottom-2 left-2 right-2 text-white text-xs">
                                                <div className="flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>{video.view_count || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-sm font-medium text-gray-900 line-clamp-2">{video.title || 'Untitled'}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </Container>
                </div>
            )}

            {/* CTA Section */}
            {!isAuthenticated && (
                <div className="bg-gradient-to-r from-primary-600 to-secondary-600">
                    <Container className="py-16 lg:py-20">
                        <div className="lg:flex lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                                    Ready to get started?
                                </h2>
                                <p className="mt-3 text-xl text-primary-100">
                                    Join thousands of beauty professionals and clients today.
                                </p>
                            </div>
                            <div className="mt-8 flex gap-4 lg:mt-0 lg:shrink-0">
                                <Button to="/register" size="lg" className="bg-white text-primary-600 hover:bg-gray-50">
                                    Sign up now
                                </Button>
                                <Button to="/login" variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                                    Sign in
                                </Button>
                            </div>
                        </div>
                    </Container>
                </div>
            )}

            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <LoadingSpinner />
                </div>
            )}
        </div>
    );
};

export default Home;
