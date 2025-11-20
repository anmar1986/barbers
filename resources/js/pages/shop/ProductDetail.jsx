import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productAPI, cartAPI } from '../../services/api';
import ProductReviews from '../../components/ProductReviews';

const ProductDetail = () => {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        loadProduct();
    }, [uuid]);

    const loadProduct = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await productAPI.getOne(uuid);
            setProduct(response.data.data || response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Product not found');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        setAddingToCart(true);
        try {
            await cartAPI.addItem(product.id, quantity);
            alert('Product added to cart!');
            navigate('/cart');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="mt-2 text-text-secondary">Loading product...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="rounded-md bg-error/10 p-4">
                    <p className="text-sm text-error">{error || 'Product not found'}</p>
                </div>
                <Link to="/shop" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
                    ← Back to Shop
                </Link>
            </div>
        );
    }

    const images = product.images && product.images.length > 0
        ? product.images
        : [{ image_url: product.image_url || '/placeholder.png' }];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <nav className="mb-8">
                <ol className="flex items-center space-x-2 text-sm">
                    <li><Link to="/shop" className="text-primary-600 hover:text-primary-700">Shop</Link></li>
                    <li><span className="text-text-secondary">/</span></li>
                    <li className="text-text-secondary">{product.name}</li>
                </ol>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Product Images */}
                <div>
                    {/* Main Image */}
                    <div className="aspect-square bg-surface rounded-lg mb-4 overflow-hidden">
                        <img
                            src={images[selectedImage]?.image_url || '/placeholder.png'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Thumbnail Gallery */}
                    {images.length > 1 && (
                        <div className="grid grid-cols-4 gap-4">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                                        selectedImage === idx ? 'border-primary-600' : 'border-border'
                                    }`}
                                >
                                    <img
                                        src={img.image_url}
                                        alt={`${product.name} ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-2">{product.name}</h1>

                    {/* Rating */}
                    {product.rating > 0 && (
                        <div className="flex items-center mb-4">
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-border fill-current'}`}
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                    </svg>
                                ))}
                            </div>
                            <span className="ml-2 text-sm text-text-secondary">({product.review_count} reviews)</span>
                        </div>
                    )}

                    {/* Price */}
                    <div className="mb-6">
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-bold text-primary-600">{formatPrice(product.price)}</span>
                            {product.compare_price && product.compare_price > product.price && (
                                <>
                                    <span className="text-xl text-text-secondary line-through">{formatPrice(product.compare_price)}</span>
                                    <span className="px-2 py-1 bg-accent-500 text-white text-sm font-semibold rounded">
                                        Save {Math.round((1 - product.price / product.compare_price) * 100)}%
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-text-primary mb-2">Description</h2>
                        <p className="text-text-secondary whitespace-pre-line">{product.description}</p>
                    </div>

                    {/* Stock Status */}
                    <div className="mb-6">
                        {product.stock_quantity > 0 ? (
                            <p className="text-success font-medium">In Stock ({product.stock_quantity} available)</p>
                        ) : (
                            <p className="text-error font-medium">Out of Stock</p>
                        )}
                    </div>

                    {/* Business Info */}
                    {product.business && (
                        <div className="mb-6 p-4 bg-surface rounded-lg">
                            <p className="text-sm text-text-secondary mb-1">Sold by</p>
                            <Link
                                to={`/businesses/${product.business.uuid}`}
                                className="text-lg font-semibold text-primary-600 hover:text-primary-700"
                            >
                                {product.business.name}
                            </Link>
                        </div>
                    )}

                    {/* Quantity Selector */}
                    {product.stock_quantity > 0 && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-text-primary mb-2">Quantity</label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-4 py-2 border border-border rounded-md hover:bg-surface"
                                >
                                    -
                                </button>
                                <span className="px-6 py-2 border border-border rounded-md bg-surface font-medium">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                                    className="px-4 py-2 border border-border rounded-md hover:bg-surface"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Add to Cart Button */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock_quantity === 0 || addingToCart}
                            className="flex-1 px-6 py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {addingToCart ? 'Adding...' : product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                        <button className="px-6 py-3 border-2 border-primary-600 text-primary-600 font-semibold rounded-md hover:bg-primary-50 transition-colors">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                    </div>

                    {/* Product Details */}
                    <div className="mt-8 border-t border-border pt-6">
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Product Details</h3>
                        <dl className="space-y-2">
                            {product.sku && (
                                <div className="flex">
                                    <dt className="text-text-secondary w-32">SKU:</dt>
                                    <dd className="text-text-primary font-medium">{product.sku}</dd>
                                </div>
                            )}
                            {product.weight && (
                                <div className="flex">
                                    <dt className="text-text-secondary w-32">Weight:</dt>
                                    <dd className="text-text-primary font-medium">{product.weight} {product.weight_unit}</dd>
                                </div>
                            )}
                            {product.category && (
                                <div className="flex">
                                    <dt className="text-text-secondary w-32">Category:</dt>
                                    <dd className="text-text-primary font-medium">{product.category.name}</dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>
            </div>

            {/* Product Reviews */}
            <div className="mt-8">
                <ProductReviews
                    productUuid={product.uuid}
                    reviews={product.reviews || []}
                    onAddReview={async (reviewData) => {
                        // In a real app, this would call an API to submit the review
                        console.log('Review submitted:', reviewData);
                        alert('Thank you for your review! (Review submission not implemented yet)');
                    }}
                />
            </div>
        </div>
    );
};

export default ProductDetail;
