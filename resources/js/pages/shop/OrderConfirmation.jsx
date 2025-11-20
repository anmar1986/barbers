import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';

const OrderConfirmation = () => {
    const { orderNumber } = useParams();
    const location = useLocation();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (orderNumber) {
            loadOrder();
        }
    }, [orderNumber]);

    const loadOrder = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await orderAPI.getOne(orderNumber);
            setOrder(response.data.data || response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Order not found');
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-warning text-white',
            confirmed: 'bg-info text-white',
            processing: 'bg-primary-600 text-white',
            shipped: 'bg-secondary-600 text-white',
            delivered: 'bg-success text-white',
            cancelled: 'bg-error text-white',
            refunded: 'bg-gray-500 text-white'
        };
        return colors[status] || 'bg-gray-500 text-white';
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="mt-2 text-text-secondary">Loading order...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="rounded-md bg-error/10 p-4 mb-6">
                    <p className="text-sm text-error">{error || 'Order not found'}</p>
                </div>
                <Link to="/shop" className="text-primary-600 hover:text-primary-700 font-medium">
                    ← Continue Shopping
                </Link>
            </div>
        );
    }

    const shippingAddress = order.shipping_address ? JSON.parse(order.shipping_address) : null;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Success Message (only show if just placed) */}
            {location.state?.orderPlaced && (
                <div className="mb-8 bg-success/10 border-2 border-success rounded-lg p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h2 className="text-2xl font-bold text-success mb-2">Order Placed Successfully!</h2>
                            <p className="text-text-secondary">
                                Thank you for your order. We've sent a confirmation email to your inbox.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Header */}
            <div className="bg-background rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary mb-2">Order #{order.order_number}</h1>
                        <p className="text-text-secondary">Placed on {formatDate(order.created_at)}</p>
                    </div>
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold capitalize mt-4 md:mt-0 ${getStatusColor(order.status)}`}>
                        {order.status}
                    </span>
                </div>

                {/* Order Progress */}
                <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center justify-between">
                        {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((status, idx) => {
                            const isCompleted = ['confirmed', 'processing', 'shipped', 'delivered'].indexOf(order.status) >= idx;
                            const isCurrent = order.status === status;

                            return (
                                <React.Fragment key={status}>
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                                            isCompleted || isCurrent ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
                                        }`}>
                                            {isCompleted ? (
                                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                idx + 1
                                            )}
                                        </div>
                                        <span className="text-xs mt-2 capitalize hidden md:block">{status}</span>
                                    </div>
                                    {idx < 4 && (
                                        <div className={`flex-1 h-1 mx-2 ${
                                            isCompleted ? 'bg-primary-600' : 'bg-gray-300'
                                        }`}></div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-background rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-text-primary mb-4">Order Items</h2>
                <div className="space-y-4">
                    {order.items?.map((item) => (
                        <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                            <div className="w-20 h-20 bg-surface rounded overflow-hidden flex-shrink-0">
                                {item.product?.image_url && (
                                    <img
                                        src={item.product.image_url}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                            <div className="flex-grow">
                                <Link
                                    to={`/shop/${item.product?.uuid}`}
                                    className="font-medium text-text-primary hover:text-primary-600"
                                >
                                    {item.product?.name}
                                </Link>
                                <p className="text-sm text-text-secondary mt-1">Quantity: {item.quantity}</p>
                                {item.product?.business && (
                                    <p className="text-sm text-text-secondary">By {item.product.business.name}</p>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-text-primary">{formatPrice(item.total)}</p>
                                <p className="text-sm text-text-secondary">{formatPrice(item.price)} each</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Shipping Address */}
                {shippingAddress && (
                    <div className="bg-background rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Shipping Address</h3>
                        <div className="text-text-secondary space-y-1">
                            <p className="font-medium text-text-primary">{shippingAddress.full_name}</p>
                            <p>{shippingAddress.address_line1}</p>
                            {shippingAddress.address_line2 && <p>{shippingAddress.address_line2}</p>}
                            <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}</p>
                            <p>{shippingAddress.country}</p>
                            <p className="mt-3">{shippingAddress.phone}</p>
                            <p>{shippingAddress.email}</p>
                        </div>
                    </div>
                )}

                {/* Payment Information */}
                <div className="bg-background rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Payment Information</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-text-secondary">Payment Method</span>
                            <span className="font-medium text-text-primary capitalize">{order.payment_method?.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-secondary">Payment Status</span>
                            <span className={`font-medium capitalize ${
                                order.payment_status === 'paid' ? 'text-success' :
                                order.payment_status === 'failed' ? 'text-error' :
                                'text-warning'
                            }`}>
                                {order.payment_status}
                            </span>
                        </div>
                        {order.payment_transaction_id && (
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Transaction ID</span>
                                <span className="font-mono text-sm text-text-primary">{order.payment_transaction_id}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Order Summary */}
            <div className="bg-background rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Order Summary</h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-text-primary">
                        <span>Subtotal</span>
                        <span className="font-medium">{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-text-primary">
                        <span>Tax</span>
                        <span className="font-medium">{formatPrice(order.tax)}</span>
                    </div>
                    <div className="flex justify-between text-text-primary">
                        <span>Shipping</span>
                        <span className="font-medium">{formatPrice(order.shipping_cost)}</span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between text-xl font-bold">
                        <span className="text-text-primary">Total</span>
                        <span className="text-primary-600">{formatPrice(order.total)}</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    to="/shop"
                    className="flex-1 px-6 py-3 bg-primary-600 text-white text-center font-semibold rounded-md hover:bg-primary-700"
                >
                    Continue Shopping
                </Link>
                {order.status === 'pending' && (
                    <button
                        onClick={async () => {
                            if (confirm('Are you sure you want to cancel this order?')) {
                                try {
                                    await orderAPI.cancel(order.order_number);
                                    loadOrder();
                                } catch (err) {
                                    alert('Failed to cancel order');
                                }
                            }
                        }}
                        className="flex-1 px-6 py-3 border-2 border-error text-error text-center font-semibold rounded-md hover:bg-error/10"
                    >
                        Cancel Order
                    </button>
                )}
            </div>

            {/* Support */}
            <div className="mt-8 text-center text-text-secondary text-sm">
                <p>Need help with your order?</p>
                <p className="mt-1">Contact us at <a href="mailto:support@barbersocial.com" className="text-primary-600 hover:text-primary-700">support@barbersocial.com</a></p>
            </div>
        </div>
    );
};

export default OrderConfirmation;
