import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ProductReviews = ({ productUuid, reviews = [], onAddReview }) => {
    const { user, isAuthenticated } = useAuth();
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            alert('Please login to leave a review');
            return;
        }

        if (!comment.trim()) {
            alert('Please write a review');
            return;
        }

        setSubmitting(true);
        try {
            if (onAddReview) {
                await onAddReview({ rating, comment });
                setComment('');
                setRating(5);
                setShowReviewForm(false);
            }
        } catch (err) {
            alert('Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const getRatingPercentages = () => {
        if (!reviews || reviews.length === 0) return {};

        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(review => {
            if (review.rating >= 1 && review.rating <= 5) {
                counts[review.rating]++;
            }
        });

        const total = reviews.length;
        return {
            5: (counts[5] / total) * 100,
            4: (counts[4] / total) * 100,
            3: (counts[3] / total) * 100,
            2: (counts[2] / total) * 100,
            1: (counts[1] / total) * 100,
        };
    };

    const getAverageRating = () => {
        if (!reviews || reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / reviews.length).toFixed(1);
    };

    const renderStars = (rating, interactive = false, size = 'md') => {
        const sizeClasses = {
            sm: 'h-4 w-4',
            md: 'h-5 w-5',
            lg: 'h-6 w-6',
            xl: 'h-8 w-8'
        };

        return [...Array(5)].map((_, index) => {
            const starValue = index + 1;
            const filled = interactive
                ? (hoveredRating || rating) >= starValue
                : rating >= starValue;

            return (
                <svg
                    key={index}
                    className={`${sizeClasses[size]} ${filled ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'} ${interactive ? 'cursor-pointer' : ''}`}
                    viewBox="0 0 20 20"
                    onClick={() => interactive && setRating(starValue)}
                    onMouseEnter={() => interactive && setHoveredRating(starValue)}
                    onMouseLeave={() => interactive && setHoveredRating(0)}
                >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
            );
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const ratingPercentages = getRatingPercentages();
    const averageRating = getAverageRating();

    return (
        <div className="bg-background rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-text-primary mb-6">Customer Reviews</h2>

            {/* Rating Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-border">
                {/* Average Rating */}
                <div className="text-center md:text-left">
                    <div className="text-5xl font-bold text-text-primary mb-2">{averageRating}</div>
                    <div className="flex justify-center md:justify-start mb-2">
                        {renderStars(parseFloat(averageRating), false, 'lg')}
                    </div>
                    <p className="text-text-secondary">
                        Based on {reviews?.length || 0} {reviews?.length === 1 ? 'review' : 'reviews'}
                    </p>
                </div>

                {/* Rating Breakdown */}
                <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center gap-3">
                            <span className="text-sm text-text-secondary w-12">{stars} star{stars !== 1 && 's'}</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-yellow-400"
                                    style={{ width: `${ratingPercentages[stars] || 0}%` }}
                                />
                            </div>
                            <span className="text-sm text-text-secondary w-12 text-right">
                                {Math.round(ratingPercentages[stars] || 0)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Write Review Button */}
            {isAuthenticated && !showReviewForm && (
                <button
                    onClick={() => setShowReviewForm(true)}
                    className="mb-6 px-6 py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 transition-colors"
                >
                    Write a Review
                </button>
            )}

            {/* Review Form */}
            {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-surface rounded-lg">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Write Your Review</h3>

                    {/* Star Rating */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Your Rating
                        </label>
                        <div className="flex gap-1">
                            {renderStars(rating, true, 'xl')}
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Your Review
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows="4"
                            placeholder="Share your experience with this product..."
                            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowReviewForm(false)}
                            className="px-6 py-2 border border-border text-text-primary font-semibold rounded-md hover:bg-surface"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
                {!reviews || reviews.length === 0 ? (
                    <div className="text-center py-12 text-text-secondary">
                        <svg className="mx-auto h-12 w-12 text-text-secondary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <p>No reviews yet</p>
                        <p className="text-sm mt-2">Be the first to review this product!</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id || review.uuid} className="border-b border-border pb-6 last:border-0">
                            {/* Review Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        {/* User Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                                            {review.user_name?.charAt(0) || review.user?.first_name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-text-primary">
                                                {review.user_name || `${review.user?.first_name} ${review.user?.last_name}` || 'Anonymous'}
                                            </p>
                                            <p className="text-sm text-text-secondary">
                                                {review.created_at ? formatDate(review.created_at) : 'Recently'}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Stars */}
                                    <div className="flex gap-1 ml-13">
                                        {renderStars(review.rating, false, 'sm')}
                                    </div>
                                </div>

                                {/* Verified Badge (if applicable) */}
                                {review.is_verified_purchase && (
                                    <span className="px-3 py-1 bg-success/10 text-success text-xs font-semibold rounded-full">
                                        Verified Purchase
                                    </span>
                                )}
                            </div>

                            {/* Review Content */}
                            <p className="text-text-primary">{review.comment || review.review}</p>

                            {/* Helpful Actions */}
                            <div className="mt-4 flex items-center gap-4">
                                <button className="text-sm text-text-secondary hover:text-text-primary flex items-center gap-1">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                    </svg>
                                    Helpful ({review.helpful_count || 0})
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProductReviews;
