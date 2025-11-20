import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, cartAPI } from '../../services/api';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addingToCart, setAddingToCart] = useState(null);
    const [filters, setFilters] = useState({
        category: '',
        minPrice: '',
        maxPrice: '',
        inStock: false
    });

    useEffect(() => {
        loadProducts();
    }, [filters]);

    const loadProducts = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (filters.minPrice) params.min_price = filters.minPrice;
            if (filters.maxPrice) params.max_price = filters.maxPrice;
            if (filters.inStock) params.in_stock = true;

            const response = await productAPI.getAll(params);
            setProducts(response.data.data || response.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (productId, event) => {
        event.preventDefault();
        event.stopPropagation();

        setAddingToCart(productId);
        try {
            await cartAPI.addItem(productId, 1);
            alert('Product added to cart!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add to cart');
        } finally {
            setAddingToCart(null);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary">Shop</h1>
                <p className="mt-2 text-text-secondary">Discover professional barber and beauty products</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-background rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Filters</h3>

                        {/* Category Filter */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Category
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            >
                                <option value="">All Categories</option>
                                <option value="hair-care">Hair Care</option>
                                <option value="styling">Styling Products</option>
                                <option value="tools">Tools & Equipment</option>
                                <option value="grooming">Grooming Kits</option>
                                <option value="accessories">Accessories</option>
                            </select>
                        </div>

                        {/* Price Range */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Price Range
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* In Stock */}
                        <div className="mb-6">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="rounded text-primary-600 focus:ring-primary-500"
                                    checked={filters.inStock}
                                    onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                                />
                                <span className="ml-2 text-sm text-text-primary">In Stock Only</span>
                            </label>
                        </div>

                        {/* Reset Filters */}
                        <button
                            onClick={() => setFilters({ category: '', minPrice: '', maxPrice: '', inStock: false })}
                            className="w-full px-4 py-2 text-sm text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="lg:col-span-3">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                            <p className="mt-2 text-text-secondary">Loading products...</p>
                        </div>
                    ) : error ? (
                        <div className="rounded-md bg-error/10 p-4">
                            <p className="text-sm text-error">{error}</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-text-primary">No products available</h3>
                            <p className="mt-1 text-sm text-gray-500">Products will appear here once they are added.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <Link
                                    key={product.uuid}
                                    to={`/shop/${product.uuid}`}
                                    className="bg-background rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                                >
                                    {/* Product Image */}
                                    <div className="aspect-square bg-surface relative">
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg className="h-16 w-16 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                            </div>
                                        )}
                                        {product.is_available === false && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                <span className="text-white font-semibold">Out of Stock</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-text-primary mb-1 line-clamp-2">{product.name}</h3>

                                        {/* Price */}
                                        <div className="flex items-baseline gap-2 mb-2">
                                            <span className="text-xl font-bold text-primary-600">{formatPrice(product.price)}</span>
                                            {product.compare_price && product.compare_price > product.price && (
                                                <span className="text-sm text-gray-500 line-through">{formatPrice(product.compare_price)}</span>
                                            )}
                                        </div>

                                        {/* Rating */}
                                        {product.rating > 0 && (
                                            <div className="flex items-center mb-2">
                                                <div className="flex text-yellow-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg
                                                            key={i}
                                                            className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-border fill-current'}`}
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                                <span className="ml-2 text-sm text-text-secondary">({product.review_count})</span>
                                            </div>
                                        )}

                                        {/* Business */}
                                        {product.business && (
                                            <p className="text-sm text-text-secondary mb-3">By {product.business.name}</p>
                                        )}

                                        {/* Add to Cart Button */}
                                        <button
                                            onClick={(e) => handleAddToCart(product.id, e)}
                                            disabled={!product.is_available || addingToCart === product.id}
                                            className="w-full mt-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {addingToCart === product.id ? 'Adding...' : product.is_available ? 'Add to Cart' : 'Out of Stock'}
                                        </button>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductList;
