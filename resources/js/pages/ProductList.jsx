import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Container from '../components/Container';
import Card from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/Badge';

const ProductList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { showError } = useToast();
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category_id: searchParams.get('category') || '',
        min_price: searchParams.get('min_price') || '',
        max_price: searchParams.get('max_price') || '',
        in_stock: searchParams.get('in_stock') === 'true',
        sort_by: searchParams.get('sort_by') || 'created_at',
        sort_order: searchParams.get('sort_order') || 'desc',
    });

    const sortOptions = [
        { value: 'created_at:desc', label: 'Newest First' },
        { value: 'price:asc', label: 'Price: Low to High' },
        { value: 'price:desc', label: 'Price: High to Low' },
        { value: 'rating:desc', label: 'Highest Rated' },
        { value: 'view_count:desc', label: 'Most Popular' },
    ];

    useEffect(() => {
        fetchProducts();
    }, [filters]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await productAPI.getAll(filters);
            setProducts(response.data.data.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            showError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        
        // Update URL params
        const params = new URLSearchParams();
        Object.keys(newFilters).forEach(k => {
            if (newFilters[k]) params.set(k, newFilters[k]);
        });
        setSearchParams(params);
    };

    const handleSortChange = (value) => {
        const [sortBy, sortOrder] = value.split(':');
        setFilters({ ...filters, sort_by: sortBy, sort_order: sortOrder });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="mb-4 sm:mb-6 lg:mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Shop Products</h1>
                <p className="mt-1 sm:mt-2 text-base sm:text-lg text-gray-600">
                    Professional grooming and styling products
                </p>
            </div>

            {/* Filters */}
            <Card className="mb-4 sm:mb-6 lg:mb-8" padding="lg">
                <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <Input
                                type="search"
                                placeholder="Search products..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                            
                            <Input
                                type="number"
                                placeholder="Min Price"
                                value={filters.min_price}
                                onChange={(e) => handleFilterChange('min_price', e.target.value)}
                            />
                            
                            <Input
                                type="number"
                                placeholder="Max Price"
                                value={filters.max_price}
                                onChange={(e) => handleFilterChange('max_price', e.target.value)}
                            />
                            
                            <Select
                                value={`${filters.sort_by}:${filters.sort_order}`}
                                onChange={(e) => handleSortChange(e.target.value)}
                                options={sortOptions}
                            />
                        </div>
                        
                        <div className="flex gap-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={filters.in_stock}
                                    onChange={(e) => handleFilterChange('in_stock', e.target.checked)}
                                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">In stock only</span>
                            </label>
                        </div>
                    </div>
                </Card>

                {/* Results */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : products.length === 0 ? (
                    <Card className="text-center py-12" padding="lg">
                        <p className="text-gray-500 text-lg">No products found</p>
                        <p className="text-gray-400 mt-2">Try adjusting your filters</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {products.map((product) => (
                            <Card key={product.id} hover className="overflow-hidden flex flex-col">
                                {/* Product Image */}
                                <div className="relative h-64 bg-gray-100">
                                    {product.images && product.images.length > 0 ? (
                                        <img
                                            src={product.images[0].image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                    
                                    {/* Stock Badge */}
                                    <div className="absolute top-2 right-2">
                                        {product.stock_quantity > 0 ? (
                                            <Badge variant="success" size="sm">
                                                In Stock ({product.stock_quantity})
                                            </Badge>
                                        ) : (
                                            <Badge variant="error" size="sm">
                                                Out of Stock
                                            </Badge>
                                        )}
                                    </div>
                                    
                                    {/* Sale Badge */}
                                    {product.compare_price && product.compare_price > product.price && (
                                        <div className="absolute top-2 left-2">
                                            <Badge variant="warning" size="sm">
                                                Sale
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-4 flex-1 flex flex-col">
                                    {/* Product Info */}
                                    <div className="mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1">
                                            {product.name}
                                        </h3>
                                        {product.category && (
                                            <p className="text-xs text-gray-500">
                                                {product.category.name}
                                            </p>
                                        )}
                                    </div>
                                    
                                    {/* Business */}
                                    {product.business && (
                                        <p className="text-sm text-gray-600 mb-3">
                                            by {product.business.business_name}
                                        </p>
                                    )}
                                    
                                    {/* Rating */}
                                    {product.rating && typeof product.rating === 'number' && product.rating > 0 && (
                                        <div className="flex items-center gap-2 mb-3 text-sm">
                                            <span className="text-yellow-500">⭐ {product.rating.toFixed(1)}</span>
                                            <span className="text-gray-500">
                                                ({product.review_count || 0} reviews)
                                            </span>
                                        </div>
                                    )}
                                    
                                    {/* Price */}
                                    <div className="mb-4 mt-auto">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold text-gray-900">
                                                {formatPrice(product.price)}
                                            </span>
                                            {product.compare_price && product.compare_price > product.price && (
                                                <span className="text-sm text-gray-500 line-through">
                                                    {formatPrice(product.compare_price)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Action Button */}
                                    <Button 
                                        to={`/products/${product.uuid}`}
                                        variant="primary"
                                        fullWidth
                                        disabled={product.stock_quantity === 0}
                                    >
                                        {product.stock_quantity > 0 ? 'View Details' : 'Out of Stock'}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
        </div>
    );
};

export default ProductList;
