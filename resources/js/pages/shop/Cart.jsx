import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Cart = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingItem, setUpdatingItem] = useState(null);

    useEffect(() => {
        if (user) {
            loadCart();
        } else {
            navigate('/login');
        }
    }, [user]);

    const loadCart = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await cartAPI.getCart();
            setCart(response.data.data || response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load cart');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;

        setUpdatingItem(cartItemId);
        try {
            await cartAPI.updateItem(cartItemId, newQuantity);
            await loadCart();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update quantity');
        } finally {
            setUpdatingItem(null);
        }
    };

    const removeItem = async (cartItemId) => {
        if (!confirm('Remove this item from cart?')) return;

        setUpdatingItem(cartItemId);
        try {
            await cartAPI.removeItem(cartItemId);
            await loadCart();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to remove item');
        } finally {
            setUpdatingItem(null);
        }
    };

    const clearCart = async () => {
        if (!confirm('Clear all items from cart?')) return;

        setLoading(true);
        try {
            await cartAPI.clearCart();
            await loadCart();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to clear cart');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const calculateSubtotal = () => {
        if (!cart?.items) return 0;
        return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const calculateTax = () => {
        return calculateSubtotal() * 0.1; // 10% tax
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax();
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="mt-2 text-text-secondary">Loading cart...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="rounded-md bg-error/10 p-4">
                    <p className="text-sm text-error">{error}</p>
                </div>
            </div>
        );
    }

    const cartItems = cart?.items || [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Shopping Cart</h1>
                    <p className="mt-2 text-text-secondary">{cartItems.length} item(s) in your cart</p>
                </div>
                {cartItems.length > 0 && (
                    <button
                        onClick={clearCart}
                        className="text-error hover:text-error/80 font-medium"
                    >
                        Clear Cart
                    </button>
                )}
            </div>

            {cartItems.length === 0 ? (
                <div className="text-center py-12 bg-surface rounded-lg">
                    <svg className="mx-auto h-16 w-16 text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h2 className="text-xl font-semibold text-text-primary mb-2">Your cart is empty</h2>
                    <p className="text-text-secondary mb-6">Add some products to get started</p>
                    <Link
                        to="/shop"
                        className="inline-block px-6 py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700"
                    >
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-background rounded-lg shadow-md p-6 flex gap-6"
                            >
                                {/* Product Image */}
                                <Link
                                    to={`/shop/${item.product?.uuid}`}
                                    className="flex-shrink-0 w-24 h-24 bg-surface rounded-lg overflow-hidden"
                                >
                                    {item.product?.image_url ? (
                                        <img
                                            src={item.product.image_url}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="h-8 w-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                        </div>
                                    )}
                                </Link>

                                {/* Product Details */}
                                <div className="flex-grow">
                                    <Link
                                        to={`/shop/${item.product?.uuid}`}
                                        className="text-lg font-semibold text-text-primary hover:text-primary-600"
                                    >
                                        {item.product?.name}
                                    </Link>
                                    {item.product?.business && (
                                        <p className="text-sm text-text-secondary mt-1">By {item.product.business.name}</p>
                                    )}
                                    <p className="text-lg font-bold text-primary-600 mt-2">{formatPrice(item.price)}</p>
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex flex-col items-end justify-between">
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        disabled={updatingItem === item.id}
                                        className="text-error hover:text-error/80"
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1 || updatingItem === item.id}
                                            className="px-3 py-1 border border-border rounded-md hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            -
                                        </button>
                                        <span className="px-4 py-1 font-medium">
                                            {updatingItem === item.id ? '...' : item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            disabled={updatingItem === item.id}
                                            className="px-3 py-1 border border-border rounded-md hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <p className="text-lg font-bold text-text-primary">
                                        {formatPrice(item.price * item.quantity)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-background rounded-lg shadow-md p-6 sticky top-4">
                            <h2 className="text-xl font-semibold text-text-primary mb-6">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-text-primary">
                                    <span>Subtotal</span>
                                    <span className="font-medium">{formatPrice(calculateSubtotal())}</span>
                                </div>
                                <div className="flex justify-between text-text-primary">
                                    <span>Tax (10%)</span>
                                    <span className="font-medium">{formatPrice(calculateTax())}</span>
                                </div>
                                <div className="flex justify-between text-text-primary">
                                    <span>Shipping</span>
                                    <span className="font-medium text-success">FREE</span>
                                </div>
                            </div>

                            <div className="border-t border-border pt-4 mb-6">
                                <div className="flex justify-between text-lg font-bold text-text-primary">
                                    <span>Total</span>
                                    <span className="text-primary-600">{formatPrice(calculateTotal())}</span>
                                </div>
                            </div>

                            <Link
                                to="/checkout"
                                className="block w-full px-6 py-3 bg-primary-600 text-white text-center font-semibold rounded-md hover:bg-primary-700 mb-3"
                            >
                                Proceed to Checkout
                            </Link>

                            <Link
                                to="/shop"
                                className="block w-full px-6 py-3 border-2 border-primary-600 text-primary-600 text-center font-semibold rounded-md hover:bg-primary-50"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
