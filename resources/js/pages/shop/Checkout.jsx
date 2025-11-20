import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI, orderAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Container from '../../components/Container';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import LoadingSpinner from '../../components/LoadingSpinner';
import StripePayment from '../../components/StripePayment';

const Checkout = () => {
    const { user } = useAuth();
    const { showError, showSuccess } = useToast();
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [error, setError] = useState('');

    const [shippingInfo, setShippingInfo] = useState({
        full_name: user?.first_name + ' ' + user?.last_name || '',
        email: user?.email || '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'United States'
    });

    const [paymentInfo, setPaymentInfo] = useState({
        method: 'credit_card',
        card_number: '',
        card_name: '',
        expiry_month: '',
        expiry_year: '',
        cvv: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadCart();
    }, [user]);

    const loadCart = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await cartAPI.getCart();
            const cartData = response.data.data || response.data;

            if (!cartData?.items || cartData.items.length === 0) {
                navigate('/cart');
                return;
            }

            setCart(cartData);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load cart');
        } finally {
            setLoading(false);
        }
    };

    const handleShippingChange = (e) => {
        setShippingInfo({
            ...shippingInfo,
            [e.target.name]: e.target.value
        });
    };

    const handlePaymentChange = (e) => {
        setPaymentInfo({
            ...paymentInfo,
            [e.target.name]: e.target.value
        });
    };

    const validateShipping = () => {
        const required = ['full_name', 'email', 'phone', 'address_line1', 'city', 'state', 'postal_code'];
        for (let field of required) {
            if (!shippingInfo[field]) {
                setError(`Please fill in ${field.replace('_', ' ')}`);
                return false;
            }
        }
        return true;
    };

    const validatePayment = () => {
        if (paymentInfo.method === 'credit_card') {
            if (!paymentInfo.card_number || paymentInfo.card_number.length < 13) {
                setError('Please enter a valid card number');
                return false;
            }
            if (!paymentInfo.card_name) {
                setError('Please enter card holder name');
                return false;
            }
            if (!paymentInfo.expiry_month || !paymentInfo.expiry_year) {
                setError('Please enter card expiry date');
                return false;
            }
            if (!paymentInfo.cvv || paymentInfo.cvv.length < 3) {
                setError('Please enter a valid CVV');
                return false;
            }
        }
        return true;
    };

    const handleNextStep = () => {
        setError('');

        if (currentStep === 1) {
            if (validateShipping()) {
                setCurrentStep(2);
            }
        } else if (currentStep === 2) {
            if (validatePayment()) {
                setCurrentStep(3);
            }
        }
    };

    const handlePaymentSuccess = async (paymentData) => {
        setError('');
        setSubmitting(true);

        try {
            const orderData = {
                shipping_address: JSON.stringify(shippingInfo),
                billing_address: JSON.stringify(shippingInfo),
                payment_method: 'stripe',
                payment_intent_id: paymentData.payment_intent_id,
                notes: ''
            };

            const response = await orderAPI.checkout(orderData);
            const order = response.data.data || response.data;

            showSuccess('Order placed successfully!');

            // Navigate to order confirmation
            navigate(`/orders/${order.order_number || order.uuid}`, {
                state: { orderPlaced: true }
            });

        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to place order';
            setError(errorMsg);
            showError(errorMsg);
            setSubmitting(false);
        }
    };

    const handlePaymentError = (errorMsg) => {
        setError(errorMsg);
        showError(errorMsg);
        setSubmitting(false);
    };

    const handlePlaceOrder = async () => {
        setError('');
        setSubmitting(true);
        
        try {
            const orderData = {
                shipping_address: JSON.stringify(shippingInfo),
                billing_address: JSON.stringify(shippingInfo),
                payment_method: paymentInfo.method,
                notes: ''
            };

            const response = await orderAPI.checkout(orderData);
            const order = response.data.data || response.data;

            showSuccess('Order placed successfully!');
            navigate(`/orders/${order.order_number || order.uuid}`, {
                state: { orderPlaced: true }
            });
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to place order';
            setError(errorMsg);
            showError(errorMsg);
            setSubmitting(false);
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
        return calculateSubtotal() * 0.1;
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax();
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="mt-2 text-text-secondary">Loading checkout...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Progress Steps */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary mb-6">Checkout</h1>

                <div className="flex items-center justify-between">
                    {[
                        { num: 1, name: 'Shipping' },
                        { num: 2, name: 'Payment' },
                        { num: 3, name: 'Review' }
                    ].map((step, idx) => (
                        <Fragment key={step.num}>
                            <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                                    currentStep >= step.num
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-300 text-gray-600'
                                }`}>
                                    {step.num}
                                </div>
                                <span className={`ml-2 font-medium ${
                                    currentStep >= step.num ? 'text-text-primary' : 'text-text-secondary'
                                }`}>
                                    {step.name}
                                </span>
                            </div>
                            {idx < 2 && (
                                <div className={`flex-1 h-1 mx-4 ${
                                    currentStep > step.num ? 'bg-primary-600' : 'bg-gray-300'
                                }`}></div>
                            )}
                        </Fragment>
                    ))}
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-md bg-error/10 border border-error p-4">
                    <p className="text-sm text-error">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    {/* Step 1: Shipping Information */}
                    {currentStep === 1 && (
                        <div className="bg-background rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-text-primary mb-6">Shipping Information</h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={shippingInfo.full_name}
                                            onChange={handleShippingChange}
                                            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={shippingInfo.email}
                                            onChange={handleShippingChange}
                                            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={shippingInfo.phone}
                                        onChange={handleShippingChange}
                                        className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">
                                        Address Line 1 *
                                    </label>
                                    <input
                                        type="text"
                                        name="address_line1"
                                        value={shippingInfo.address_line1}
                                        onChange={handleShippingChange}
                                        placeholder="Street address, P.O. box"
                                        className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">
                                        Address Line 2
                                    </label>
                                    <input
                                        type="text"
                                        name="address_line2"
                                        value={shippingInfo.address_line2}
                                        onChange={handleShippingChange}
                                        placeholder="Apartment, suite, unit, etc."
                                        className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-2">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={shippingInfo.city}
                                            onChange={handleShippingChange}
                                            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-2">
                                            State *
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={shippingInfo.state}
                                            onChange={handleShippingChange}
                                            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-2">
                                            ZIP Code *
                                        </label>
                                        <input
                                            type="text"
                                            name="postal_code"
                                            value={shippingInfo.postal_code}
                                            onChange={handleShippingChange}
                                            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">
                                        Country *
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={shippingInfo.country}
                                        onChange={handleShippingChange}
                                        className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleNextStep}
                                className="w-full mt-6 px-6 py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700"
                            >
                                Continue to Payment
                            </button>
                        </div>
                    )}

                    {/* Step 2: Payment Information */}
                    {currentStep === 2 && (
                        <div>
                            <StripePayment
                                amount={calculateTotal()}
                                onSuccess={handlePaymentSuccess}
                                onError={handlePaymentError}
                                loading={submitting}
                            />

                            <div className="flex gap-4 mt-6">
                                <Button
                                    onClick={() => setCurrentStep(1)}
                                    variant="outline"
                                    disabled={submitting}
                                >
                                    Back to Shipping
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2 OLD: Payment Information
                    {currentStep === 2 && (
                        <div className="bg-background rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-text-primary mb-6">Payment Information OLD</h2>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-text-primary mb-3">
                                    Payment Method
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center p-4 border-2 border-border rounded-lg cursor-pointer hover:bg-surface">
                                        <input
                                            type="radio"
                                            name="method"
                                            value="credit_card"
                                            checked={paymentInfo.method === 'credit_card'}
                                            onChange={handlePaymentChange}
                                            className="text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="ml-3 font-medium">Credit/Debit Card</span>
                                    </label>
                                    <label className="flex items-center p-4 border-2 border-border rounded-lg cursor-pointer hover:bg-surface">
                                        <input
                                            type="radio"
                                            name="method"
                                            value="paypal"
                                            checked={paymentInfo.method === 'paypal'}
                                            onChange={handlePaymentChange}
                                            className="text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="ml-3 font-medium">PayPal</span>
                                    </label>
                                    <label className="flex items-center p-4 border-2 border-border rounded-lg cursor-pointer hover:bg-surface">
                                        <input
                                            type="radio"
                                            name="method"
                                            value="cod"
                                            checked={paymentInfo.method === 'cod'}
                                            onChange={handlePaymentChange}
                                            className="text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="ml-3 font-medium">Cash on Delivery</span>
                                    </label>
                                </div>
                            </div>

                            {paymentInfo.method === 'credit_card' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-2">
                                            Card Number *
                                        </label>
                                        <input
                                            type="text"
                                            name="card_number"
                                            value={paymentInfo.card_number}
                                            onChange={handlePaymentChange}
                                            placeholder="1234 5678 9012 3456"
                                            maxLength="19"
                                            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-2">
                                            Card Holder Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="card_name"
                                            value={paymentInfo.card_name}
                                            onChange={handlePaymentChange}
                                            placeholder="John Doe"
                                            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-text-primary mb-2">
                                                Month *
                                            </label>
                                            <select
                                                name="expiry_month"
                                                value={paymentInfo.expiry_month}
                                                onChange={handlePaymentChange}
                                                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                required
                                            >
                                                <option value="">MM</option>
                                                {[...Array(12)].map((_, i) => (
                                                    <option key={i} value={String(i + 1).padStart(2, '0')}>
                                                        {String(i + 1).padStart(2, '0')}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text-primary mb-2">
                                                Year *
                                            </label>
                                            <select
                                                name="expiry_year"
                                                value={paymentInfo.expiry_year}
                                                onChange={handlePaymentChange}
                                                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                required
                                            >
                                                <option value="">YYYY</option>
                                                {[...Array(10)].map((_, i) => (
                                                    <option key={i} value={new Date().getFullYear() + i}>
                                                        {new Date().getFullYear() + i}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text-primary mb-2">
                                                CVV *
                                            </label>
                                            <input
                                                type="text"
                                                name="cvv"
                                                value={paymentInfo.cvv}
                                                onChange={handlePaymentChange}
                                                placeholder="123"
                                                maxLength="4"
                                                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={() => setCurrentStep(1)}
                                    className="flex-1 px-6 py-3 border-2 border-primary-600 text-primary-600 font-semibold rounded-md hover:bg-primary-50"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleNextStep}
                                    className="flex-1 px-6 py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700"
                                >
                                    Review Order
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review Order */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            {/* Shipping Address Review */}
                            <div className="bg-background rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold text-text-primary">Shipping Address</h3>
                                    <button
                                        onClick={() => setCurrentStep(1)}
                                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                </div>
                                <div className="text-text-secondary">
                                    <p>{shippingInfo.full_name}</p>
                                    <p>{shippingInfo.address_line1}</p>
                                    {shippingInfo.address_line2 && <p>{shippingInfo.address_line2}</p>}
                                    <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.postal_code}</p>
                                    <p>{shippingInfo.country}</p>
                                    <p className="mt-2">{shippingInfo.phone}</p>
                                    <p>{shippingInfo.email}</p>
                                </div>
                            </div>

                            {/* Payment Method Review */}
                            <div className="bg-background rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold text-text-primary">Payment Method</h3>
                                    <button
                                        onClick={() => setCurrentStep(2)}
                                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                </div>
                                <div className="text-text-secondary">
                                    {paymentInfo.method === 'credit_card' && (
                                        <>
                                            <p className="font-medium">Credit/Debit Card</p>
                                            <p>**** **** **** {paymentInfo.card_number.slice(-4)}</p>
                                            <p>{paymentInfo.card_name}</p>
                                        </>
                                    )}
                                    {paymentInfo.method === 'paypal' && <p className="font-medium">PayPal</p>}
                                    {paymentInfo.method === 'cod' && <p className="font-medium">Cash on Delivery</p>}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="bg-background rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold text-text-primary mb-4">Order Items</h3>
                                <div className="space-y-4">
                                    {cart?.items?.map((item) => (
                                        <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                                            <div className="w-16 h-16 bg-surface rounded overflow-hidden flex-shrink-0">
                                                {item.product?.image_url && (
                                                    <img
                                                        src={item.product.image_url}
                                                        alt={item.product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-grow">
                                                <h4 className="font-medium text-text-primary">{item.product?.name}</h4>
                                                <p className="text-sm text-text-secondary">Quantity: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-text-primary">
                                                    {formatPrice(item.price * item.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setCurrentStep(2)}
                                    className="flex-1 px-6 py-3 border-2 border-primary-600 text-primary-600 font-semibold rounded-md hover:bg-primary-50"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={submitting}
                                    className="flex-1 px-6 py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Placing Order...' : 'Place Order'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Order Summary Sidebar */}
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

                        <div className="text-sm text-text-secondary space-y-2">
                            <p className="flex items-start">
                                <svg className="h-5 w-5 text-success mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Secure checkout
                            </p>
                            <p className="flex items-start">
                                <svg className="h-5 w-5 text-success mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Free shipping on all orders
                            </p>
                            <p className="flex items-start">
                                <svg className="h-5 w-5 text-success mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                30-day return policy
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
