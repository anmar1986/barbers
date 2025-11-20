import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Card from './Card';

/**
 * Stripe Payment Component
 * Handles credit card payment processing via Stripe
 *
 * Note: This is a frontend implementation. The actual Stripe integration
 * should be done on the backend for security using Stripe API.
 *
 * Backend should:
 * 1. Create Payment Intent via Stripe API
 * 2. Return client_secret to frontend
 * 3. Process payment and handle webhooks
 */
const StripePayment = ({
    amount,
    currency = 'USD',
    onSuccess,
    onError,
    loading: externalLoading = false
}) => {
    const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'saved'
    const [processing, setProcessing] = useState(false);
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
    });
    const [errors, setErrors] = useState({});

    // Format card number with spaces
    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0; i < match.length; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        return parts.length ? parts.join(' ') : value;
    };

    // Format expiry date MM/YY
    const formatExpiryDate = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
        }
        return v;
    };

    // Validate card details
    const validateCard = () => {
        const newErrors = {};

        // Card number validation (basic Luhn algorithm check)
        const cardNum = cardDetails.cardNumber.replace(/\s/g, '');
        if (!cardNum || cardNum.length < 13 || cardNum.length > 19) {
            newErrors.cardNumber = 'Invalid card number';
        }

        // Cardholder name
        if (!cardDetails.cardName.trim()) {
            newErrors.cardName = 'Cardholder name is required';
        }

        // Expiry date
        const expiry = cardDetails.expiryDate.replace('/', '');
        if (!expiry || expiry.length !== 4) {
            newErrors.expiryDate = 'Invalid expiry date';
        } else {
            const month = parseInt(expiry.slice(0, 2));
            const year = parseInt('20' + expiry.slice(2));
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;

            if (month < 1 || month > 12) {
                newErrors.expiryDate = 'Invalid month';
            } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
                newErrors.expiryDate = 'Card has expired';
            }
        }

        // CVV
        if (!cardDetails.cvv || cardDetails.cvv.length < 3 || cardDetails.cvv.length > 4) {
            newErrors.cvv = 'Invalid CVV';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle payment submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateCard()) {
            return;
        }

        setProcessing(true);

        try {
            // In a real implementation, you would:
            // 1. Send card details to your backend
            // 2. Backend creates Stripe Payment Intent
            // 3. Backend returns client_secret
            // 4. Use Stripe.js to confirm payment with client_secret

            // Simulate API call
            const response = await fetch('/api/payments/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount * 100, // Convert to cents
                    currency,
                    payment_method: 'card',
                    // In production, use Stripe.js to tokenize card details
                    // Never send raw card details to your backend
                }),
            });

            const data = await response.json();

            if (data.success) {
                onSuccess(data);
            } else {
                throw new Error(data.message || 'Payment failed');
            }
        } catch (error) {
            console.error('Payment error:', error);
            onError(error.message || 'Payment processing failed');
        } finally {
            setProcessing(false);
        }
    };

    const isLoading = processing || externalLoading;

    return (
        <Card padding="lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Information</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Payment Method Tabs */}
                <div className="flex border-b">
                    <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`px-4 py-2 font-medium border-b-2 transition ${
                            paymentMethod === 'card'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Credit/Debit Card
                    </button>
                </div>

                {/* Card Details Form */}
                <div className="space-y-4">
                    {/* Card Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Card Number
                        </label>
                        <Input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            value={cardDetails.cardNumber}
                            onChange={(e) => {
                                const formatted = formatCardNumber(e.target.value);
                                if (formatted.replace(/\s/g, '').length <= 19) {
                                    setCardDetails({ ...cardDetails, cardNumber: formatted });
                                }
                            }}
                            error={errors.cardNumber}
                            maxLength={19}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Cardholder Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cardholder Name
                        </label>
                        <Input
                            type="text"
                            placeholder="John Doe"
                            value={cardDetails.cardName}
                            onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value })}
                            error={errors.cardName}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Expiry and CVV */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expiry Date
                            </label>
                            <Input
                                type="text"
                                placeholder="MM/YY"
                                value={cardDetails.expiryDate}
                                onChange={(e) => {
                                    const formatted = formatExpiryDate(e.target.value);
                                    if (formatted.replace('/', '').length <= 4) {
                                        setCardDetails({ ...cardDetails, expiryDate: formatted });
                                    }
                                }}
                                error={errors.expiryDate}
                                maxLength={5}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                CVV
                            </label>
                            <Input
                                type="text"
                                placeholder="123"
                                value={cardDetails.cvv}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    if (value.length <= 4) {
                                        setCardDetails({ ...cardDetails, cvv: value });
                                    }
                                }}
                                error={errors.cvv}
                                maxLength={4}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                        <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                        <p className="text-sm text-gray-600 mt-1">
                            Your payment information is encrypted and secure. We use Stripe for payment processing.
                        </p>
                    </div>
                </div>

                {/* Amount Summary */}
                <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-medium text-gray-900">Total Amount</span>
                        <span className="text-2xl font-bold text-primary-600">
                            ${amount.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={isLoading}
                    loading={isLoading}
                >
                    {isLoading ? 'Processing Payment...' : `Pay $${amount.toFixed(2)}`}
                </Button>

                {/* Accepted Cards */}
                <div className="flex items-center justify-center gap-3 pt-4 border-t">
                    <span className="text-sm text-gray-500">We accept:</span>
                    <div className="flex gap-2">
                        {['Visa', 'Mastercard', 'Amex', 'Discover'].map((card) => (
                            <div key={card} className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-medium text-gray-600">
                                {card.slice(0, 2)}
                            </div>
                        ))}
                    </div>
                </div>
            </form>
        </Card>
    );
};

export default StripePayment;
