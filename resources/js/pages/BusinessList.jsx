import { useState, useEffect } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { businessAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Container from '../components/Container';
import Card from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/Badge';
import GoogleMap from '../components/GoogleMap';

const BusinessList = () => {
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { showError, showSuccess } = useToast();

    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', or 'map'
    const [showFilters, setShowFilters] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    
    // Detect route and set default business type

    
    const [filters, setFilters] = useState({
        business_type: '',
        city: searchParams.get('city') || '',
        search: searchParams.get('search') || '',
        verified: searchParams.get('verified') || '',
        rating_min: searchParams.get('rating_min') || '',
        open_now: searchParams.get('open_now') || '',
        distance: searchParams.get('distance') || '',
        order_by: 'average_rating',
        order_direction: 'desc',
    });

    const businessTypes = [
        { value: '', label: 'All Types' },
        { value: 'barber', label: 'Barber Shop' },
        { value: 'nail_studio', label: 'Nail Studio' },
        { value: 'hair_salon', label: 'Hair Salon' },
        { value: 'massage', label: 'Massage Center' },
    ];

    const sortOptions = [
        { value: 'rating', label: 'Highest Rated' },
        { value: 'distance', label: 'Nearest' },
        { value: 'review_count', label: 'Most Reviews' },
        { value: 'created_at', label: 'Newest' },
    ];

    const distanceOptions = [
        { value: '', label: 'Any Distance' },
        { value: '5', label: 'Within 5 km' },
        { value: '10', label: 'Within 10 km' },
        { value: '25', label: 'Within 25 km' },
        { value: '50', label: 'Within 50 km' },
    ];

    const ratingOptions = [
        { value: '', label: 'All Ratings' },
        { value: '4', label: '4+ Stars' },
        { value: '3', label: '3+ Stars' },
    ];

    useEffect(() => {
        getUserLocation();
        // Set initial business type based on route
        let initialType = '';
        if (location.pathname.includes('/barbers')) {
            initialType = 'barber';
        } else if (location.pathname.includes('/beauty')) {
            initialType = 'beauty';
        } else {
            initialType = searchParams.get('type') || '';
        }
        
        if (initialType) {
            setFilters(prev => ({ ...prev, business_type: initialType }));
        } else {
            // Even if no type, trigger fetch
            fetchBusinesses();
        }
    }, []);

    useEffect(() => {
        // Update business_type filter when route changes
        let newType = '';
        if (location.pathname.includes('/barbers')) {
            newType = 'barber';
        } else if (location.pathname.includes('/beauty')) {
            newType = 'beauty';
        }
        
        if (newType && newType !== filters.business_type) {
            setFilters(prev => ({ ...prev, business_type: newType }));
        }
    }, [location.pathname, filters.business_type]);

    useEffect(() => {
        fetchBusinesses();
    }, [filters]);

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    // Location access denied - continue without location
                }
            );
        }
    };

    const fetchBusinesses = async () => {
        setLoading(true);
        try {
            const queryParams = { ...filters };
            
            // Handle 'beauty' filter - it's not a real business_type
            const isBeautyFilter = queryParams.business_type === 'beauty';
            if (isBeautyFilter) {
                // Remove the beauty filter from API params, we'll filter client-side
                delete queryParams.business_type;
            }
            
            if (userLocation && filters.distance) {
                queryParams.lat = userLocation.lat;
                queryParams.lng = userLocation.lng;
            }

            const response = await businessAPI.getAll(queryParams);
            
            let data = response.data.data?.data || response.data.data || [];
            
            // If business_type was 'beauty', filter client-side for beauty types
            if (isBeautyFilter) {
                const beautyTypes = ['nail_studio', 'hair_salon', 'massage', 'spa'];
                data = data.filter(business => 
                    beautyTypes.includes(business.business_type)
                );
            }
            
            setBusinesses(data);
        } catch (error) {
            console.error('Error fetching businesses - Full error:', error);
            console.error('Error response:', error.response);
            console.error('Error message:', error.message);
            showError('Failed to load businesses');
            setBusinesses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        const params = new URLSearchParams();
        Object.keys(newFilters).forEach(k => {
            if (newFilters[k]) params.set(k, newFilters[k]);
        });
        setSearchParams(params);
    };

    const clearFilters = () => {
        const clearedFilters = {
            business_type: '',
            city: '',
            search: '',
            verified: '',
            rating_min: '',
            open_now: '',
            distance: '',
            order_by: 'rating',
            order_direction: 'desc',
        };
        setFilters(clearedFilters);
        setSearchParams(new URLSearchParams());
    };

    const getActiveFiltersCount = () => {
        return Object.keys(filters).filter(key =>
            !['order_by', 'order_direction'].includes(key) && filters[key]
        ).length;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Discover Businesses</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Find the best barbers, salons, and beauty professionals
                    </p>
                </div>

                {/* View Toggle */}
                <div className="hidden md:flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-200'}`}
                        title="Grid View"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-200'}`}
                        title="List View"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={`p-2 rounded ${viewMode === 'map' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-200'}`}
                        title="Map View"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                {/* Filters Sidebar */}
                <aside className={`lg:col-span-3 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                    <Card padding="lg" className="sticky top-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                            {getActiveFiltersCount() > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-primary-600 hover:text-primary-700"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search
                                </label>
                                <Input
                                    type="search"
                                    placeholder="Business name..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                            </div>

                            {/* Business Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Business Type
                                </label>
                                <Select
                                    value={filters.business_type}
                                    onChange={(e) => handleFilterChange('business_type', e.target.value)}
                                    options={businessTypes}
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location
                                </label>
                                <Input
                                    type="text"
                                    placeholder="City name..."
                                    value={filters.city}
                                    onChange={(e) => handleFilterChange('city', e.target.value)}
                                />
                            </div>

                            {/* Distance */}
                            {userLocation && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <span className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            Distance
                                        </span>
                                    </label>
                                    <Select
                                        value={filters.distance}
                                        onChange={(e) => handleFilterChange('distance', e.target.value)}
                                        options={distanceOptions}
                                    />
                                </div>
                            )}

                            {/* Rating */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Minimum Rating
                                </label>
                                <Select
                                    value={filters.rating_min}
                                    onChange={(e) => handleFilterChange('rating_min', e.target.value)}
                                    options={ratingOptions}
                                />
                            </div>

                            {/* Checkboxes */}
                            <div className="space-y-3 pt-3 border-t">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.verified === '1'}
                                        onChange={(e) => handleFilterChange('verified', e.target.checked ? '1' : '')}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    />
                                    <span className="ml-3 text-sm text-gray-700 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Verified only
                                    </span>
                                </label>

                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.open_now === '1'}
                                        onChange={(e) => handleFilterChange('open_now', e.target.checked ? '1' : '')}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    />
                                    <span className="ml-3 text-sm text-gray-700 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                        Open now
                                    </span>
                                </label>
                            </div>
                        </div>
                    </Card>
                </aside>

                {/* Main Content */}
                <main className="lg:col-span-9 mt-6 lg:mt-0">
                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden mb-4 flex items-center justify-between">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-300"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filters
                            {getActiveFiltersCount() > 0 && (
                                <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {getActiveFiltersCount()}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Results Header */}
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-gray-700">
                                <span className="font-semibold">{businesses.length}</span> businesses found
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-sm text-gray-600">Sort by:</label>
                            <Select
                                value={filters.order_by}
                                onChange={(e) => handleFilterChange('order_by', e.target.value)}
                                options={sortOptions}
                                className="w-auto"
                            />
                        </div>
                    </div>

                    {/* Results */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : viewMode === 'map' ? (
                        <div>
                            <GoogleMap
                                businesses={businesses}
                                center={userLocation || undefined}
                                height="600px"
                            />
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-4">Businesses on Map ({businesses.length})</h3>
                                <div className="space-y-3">
                                    {businesses.map((business) => (
                                        <Link key={business.id} to={`/businesses/${business.uuid}`}>
                                            <Card hover className="flex items-center gap-4 p-4">
                                                <img
                                                    src={business.cover_image || '/images/default-business.jpg'}
                                                    alt={business.business_name}
                                                    className="w-20 h-20 object-cover rounded-lg"
                                                />
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">{business.business_name}</h4>
                                                    <p className="text-sm text-gray-600 capitalize">{business.business_type?.replace('_', ' ')}</p>
                                                    {business.city && business.state && (
                                                        <p className="text-sm text-gray-500">{business.city}, {business.state}</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <svg className="w-4 h-4 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        {business.average_rating != null ? parseFloat(business.average_rating).toFixed(1) : 'N/A'}
                                                    </div>
                                                    {business.is_verified && (
                                                        <Badge variant="success" size="sm" className="mt-1">Verified</Badge>
                                                    )}
                                                </div>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : businesses.length === 0 ? (
                        <Card className="text-center py-16" padding="lg">
                            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-600 text-lg font-medium mb-2">No businesses found</p>
                            <p className="text-gray-500">Try adjusting your filters or search terms</p>
                            {getActiveFiltersCount() > 0 && (
                                <Button variant="outline" onClick={clearFilters} className="mt-4">
                                    Clear all filters
                                </Button>
                            )}
                        </Card>
                    ) : (
                        <div className={viewMode === 'grid'
                            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6'
                            : 'space-y-4'
                        }>
                            {businesses.map((business) => (
                                <Link key={business.id} to={`/businesses/${business.uuid}`}>
                                    <Card hover className={`overflow-hidden h-full ${viewMode === 'list' ? 'flex' : ''}`}>
                                        {/* Business Image */}
                                        <div className={`bg-linear-to-br from-primary-100 to-secondary-100 shrink-0 ${
                                            viewMode === 'grid' ? 'h-48 w-full' : 'h-full w-48'
                                        }`}>
                                            {business.cover_image && (
                                                <img
                                                    src={business.cover_image}
                                                    alt={business.business_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>

                                        <div className="p-6 flex flex-col grow">
                                            {/* Business Info */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-semibold text-gray-900">
                                                        {business.business_name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 capitalize mt-1">
                                                        {business.business_type?.replace('_', ' ')}
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

                                            {/* Location */}
                                            {business.city && business.state && (
                                                <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {business.city}, {business.state}
                                                </p>
                                            )}

                                            {/* Description */}
                                            {business.description && (
                                                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                                    {business.description}
                                                </p>
                                            )}

                                            {/* Stats */}
                                            <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    {business.average_rating != null ? parseFloat(business.average_rating).toFixed(1) : 'N/A'}
                                                </span>
                                                <span>·</span>
                                                <span>{business.total_reviews || 0} reviews</span>
                                            </div>

                                            {/* Services Preview */}
                                            {business.services && business.services.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {business.services.slice(0, 3).map((service, idx) => (
                                                        <Badge key={idx} variant="secondary" size="sm">
                                                            {service.name}
                                                        </Badge>
                                                    ))}
                                                    {business.services.length > 3 && (
                                                        <Badge variant="gray" size="sm">
                                                            +{business.services.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default BusinessList;
