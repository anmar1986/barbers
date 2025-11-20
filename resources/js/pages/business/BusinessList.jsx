import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { businessAPI } from '../../services/api';

const BusinessList = ({ type = null }) => {
    const location = useLocation();
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        type: '',
        rating: ''
    });

    // Determine page title and description based on type
    const getPageInfo = () => {
        if (type === 'barber') {
            return {
                title: 'Barbers',
                description: 'Find the best barber shops near you',
                basePath: '/barbers'
            };
        } else if (type === 'beauty') {
            return {
                title: 'Beauty Services',
                description: 'Discover nail studios, spas, and hair salons',
                basePath: '/beauty'
            };
        }
        return {
            title: 'Find Businesses',
            description: 'Discover top-rated barbers and beauty professionals',
            basePath: '/businesses'
        };
    };

    const pageInfo = getPageInfo();

    useEffect(() => {
        loadBusinesses();
    }, [filters, type]);

    const loadBusinesses = async () => {
        setLoading(true);
        // Add type filter if specified
        const searchFilters = { ...filters };
        if (type === 'barber') {
            searchFilters.type = 'barber';
        } else if (type === 'beauty') {
            // Filter for beauty types: nail_studio, hair_salon, massage, spa
            searchFilters.beauty = true;
        }

        const result = await businessAPI.getAll(searchFilters);
        if (result.success) {
            setBusinesses(result.data);
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    const getRatingStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={i} className="text-yellow-400">★</span>);
        }
        if (hasHalfStar) {
            stars.push(<span key="half" className="text-yellow-400">★</span>);
        }
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<span key={`empty-${i}`} className="text-border">★</span>);
        }
        return stars;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary">{pageInfo.title}</h1>
                <p className="mt-2 text-text-secondary">{pageInfo.description}</p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-4">
                <select
                    className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                    <option value="">All Types</option>
                    <option value="barbershop">Barbershop</option>
                    <option value="salon">Salon</option>
                    <option value="spa">Spa</option>
                    <option value="nail_salon">Nail Salon</option>
                </select>
                <select
                    className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={filters.rating}
                    onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                >
                    <option value="">All Ratings</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                </select>
            </div>

            {/* Loading */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="mt-2 text-text-secondary">Loading businesses...</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="rounded-md bg-error/10 p-4">
                    <p className="text-sm text-error">{error}</p>
                </div>
            )}

            {/* Business Grid */}
            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {businesses.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-text-secondary">No businesses found</p>
                        </div>
                    ) : (
                        businesses.map((business) => (
                            <Link
                                key={business.uuid}
                                to={`${pageInfo.basePath}/${business.uuid}`}
                                className="bg-background rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                {/* Business Image */}
                                <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                                    {business.logo_url ? (
                                        <img
                                            src={business.logo_url}
                                            alt={business.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <svg className="h-16 w-16 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    )}
                                </div>

                                {/* Business Info */}
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-text-primary mb-1">{business.name}</h3>
                                    <p className="text-sm text-text-secondary capitalize mb-2">{business.type?.replace('_', ' ')}</p>

                                    {/* Rating */}
                                    <div className="flex items-center mb-2">
                                        <div className="flex">
                                            {getRatingStars(business.rating || 0)}
                                        </div>
                                        <span className="ml-2 text-sm text-text-secondary">
                                            {business.rating ? business.rating.toFixed(1) : '0.0'}
                                        </span>
                                    </div>

                                    {/* Location */}
                                    {business.location && (
                                        <div className="flex items-center text-sm text-text-secondary mb-2">
                                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>{business.location}</span>
                                        </div>
                                    )}

                                    {/* Contact */}
                                    {business.phone && (
                                        <div className="flex items-center text-sm text-text-secondary">
                                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <span>{business.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default BusinessList;
