import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Container from '../components/Container';
import Button from '../components/Button';

const VideoDetail = () => {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { showSuccess, showError } = useToast();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        fetchVideo();
    }, [uuid]);

    const fetchVideo = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/videos/${uuid}`);
            const videoData = response.data.data || response.data;

            setVideo(videoData);

            // Set is_liked from the API response
            // The backend returns is_liked based on the authenticated user
            setIsLiked(videoData.is_liked === true);

            // Fetch comments
            if (videoData.uuid) {
                fetchComments();
            }
        } catch (error) {
            console.error('Error fetching video:', error);
            showError('Failed to load video');
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await api.get(`/videos/${uuid}/comments`);
            setComments(response.data.data || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleLike = async () => {
        if (!isAuthenticated) {
            showError('Please login to like videos');
            return;
        }

        try {
            let response;
            if (isLiked) {
                response = await api.post(`/videos/${uuid}/unlike`);
            } else {
                response = await api.post(`/videos/${uuid}/like`);
            }

            // Update video state using data from API response
            if (response.data.success && response.data.data) {
                setVideo({ ...video, like_count: response.data.data.like_count });
                setIsLiked(response.data.data.is_liked);
            }
        } catch (error) {
            console.error('Error liking video:', error);
            showError('Failed to update like status');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            const response = await api.delete(`/videos/${uuid}/comments/${commentId}`);

            if (response.data.success) {
                setComments(comments.filter(c => c.id !== commentId));
                if (response.data.data && response.data.data.comment_count !== undefined) {
                    setVideo({ ...video, comment_count: response.data.data.comment_count });
                }
                showSuccess('Comment deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            showError('Failed to delete comment');
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            showError('Please login to comment');
            return;
        }

        if (!newComment.trim()) return;

        try {
            setSubmittingComment(true);
            const response = await api.post(`/videos/${uuid}/comments`, {
                comment_text: newComment
            });
            setComments([response.data.data, ...comments]);
            setNewComment('');
            setVideo({ ...video, comment_count: video.comment_count + 1 });
            showSuccess('Comment added successfully');
        } catch (error) {
            console.error('Error adding comment:', error);
            showError('Failed to add comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num || 0;
    };

    if (loading) {
        return (
            <Container>
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-xl text-text-secondary">Loading...</div>
                </div>
            </Container>
        );
    }

    if (!video) {
        return (
            <Container>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-text-primary mb-4">Video not found</h2>
                    <Button onClick={() => navigate('/videos')}>Back to Videos</Button>
                </div>
            </Container>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Container>
                <div className="py-8">
                    <Button onClick={() => navigate('/videos')} className="mb-6">
                        ← Back to Feed
                    </Button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Video Player */}
                        <div className="lg:col-span-2">
                            <div className="bg-black rounded-lg overflow-hidden aspect-video">
                                {video.video_url ? (
                                    <video
                                        src={video.video_url}
                                        controls
                                        autoPlay
                                        className="w-full h-full"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white">
                                        <p>Video not available</p>
                                    </div>
                                )}
                            </div>

                            {/* Video Info */}
                            <div className="bg-background rounded-lg shadow-md p-6 mt-4">
                                <h1 className="text-2xl font-bold text-text-primary mb-2">{video.title}</h1>

                                {/* Business Info */}
                                {video.business && (
                                    <Link
                                        to={`/businesses/${video.business.uuid}`}
                                        className="flex items-center gap-3 mb-4 hover:bg-surface p-2 rounded-lg transition"
                                    >
                                        {video.business.logo ? (
                                            <img
                                                src={video.business.logo}
                                                alt={video.business.business_name}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                                                {video.business.business_name?.charAt(0) || 'B'}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-text-primary">{video.business.business_name}</p>
                                            <p className="text-sm text-text-secondary capitalize">
                                                {video.business.business_type?.replace('_', ' ')}
                                            </p>
                                        </div>
                                    </Link>
                                )}

                                {/* Description */}
                                {video.description && (
                                    <p className="text-text-primary mb-4">{video.description}</p>
                                )}

                                {/* Stats and Actions */}
                                <div className="flex items-center gap-6 mb-4">
                                    <button
                                        onClick={handleLike}
                                        className="flex items-center gap-2 hover:text-red-600 transition"
                                    >
                                        <svg
                                            className={`w-6 h-6 ${isLiked ? 'fill-red-600 text-red-600' : 'fill-none'}`}
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        <span className="font-semibold">{formatNumber(video.like_count)}</span>
                                    </button>

                                    <div className="flex items-center gap-2">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <span className="font-semibold">{formatNumber(video.view_count)}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <span className="font-semibold">{formatNumber(video.comment_count)}</span>
                                    </div>
                                </div>

                                {/* Hashtags */}
                                {video.hashtags && video.hashtags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {video.hashtags.map((tag, index) => (
                                            <span key={index} className="text-sm text-primary-600">
                                                #{typeof tag === 'string' ? tag : tag.hashtag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="lg:col-span-1">
                            <div className="bg-background rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-bold text-text-primary mb-4">
                                    Comments ({formatNumber(video.comment_count)})
                                </h2>

                                {/* Add Comment */}
                                {isAuthenticated && (
                                    <form onSubmit={handleSubmitComment} className="mb-6">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Add a comment..."
                                            rows="3"
                                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={submittingComment || !newComment.trim()}
                                            className="mt-2"
                                        >
                                            {submittingComment ? 'Posting...' : 'Post Comment'}
                                        </Button>
                                    </form>
                                )}

                                {/* Comments List */}
                                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                    {comments.length === 0 ? (
                                        <p className="text-text-secondary text-center py-8">No comments yet</p>
                                    ) : (
                                        comments.map((comment) => (
                                            <div key={comment.id} className="border-b border-border pb-4 last:border-0">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                                        {comment.user?.first_name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-sm text-text-primary">
                                                                    {comment.user?.first_name || 'Anonymous'} {comment.user?.last_name || ''}
                                                                </p>
                                                                <p className="text-text-primary mt-1">{comment.comment_text}</p>
                                                                <p className="text-xs text-text-secondary mt-1">
                                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            {comment.can_delete && (
                                                                <button
                                                                    onClick={() => handleDeleteComment(comment.id)}
                                                                    className="text-red-500 hover:text-red-700 transition ml-2"
                                                                    title="Delete comment"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default VideoDetail;
