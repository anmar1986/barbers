import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { videoAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const VideoPlayer = ({ video, autoPlay = false, onVideoEnd = null, showComments = true }) => {
    const { user, isAuthenticated } = useAuth();
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isMuted, setIsMuted] = useState(true);
    const [isLiked, setIsLiked] = useState(video.is_liked || false);
    const [likeCount, setLikeCount] = useState(video.likes_count || 0);
    const [showCommentsPanel, setShowCommentsPanel] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);

    // Sync isLiked state with video prop when it changes
    useEffect(() => {
        setIsLiked(video.is_liked === true);
    }, [video.is_liked]);

    useEffect(() => {
        if (autoPlay && videoRef.current) {
            videoRef.current.play().catch(() => {
                // Autoplay was prevented
                setIsPlaying(false);
            });
        }
    }, [autoPlay]);

    useEffect(() => {
        if (showCommentsPanel && comments.length === 0) {
            loadComments();
        }
    }, [showCommentsPanel]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleLike = async () => {
        if (!isAuthenticated) {
            alert('Please login to like videos');
            return;
        }

        try {
            const result = isLiked ? await videoAPI.unlike(video.uuid) : await videoAPI.like(video.uuid);

            if (result.status === 200 && result.data.success && result.data.data) {
                setIsLiked(result.data.data.is_liked);
                setLikeCount(result.data.data.like_count);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const loadComments = async () => {
        setLoadingComments(true);
        try {
            const response = await videoAPI.getComments(video.uuid);
            setComments(response.data.data || response.data || []);
        } catch (err) {
            console.error('Failed to load comments:', err);
        } finally {
            setLoadingComments(false);
        }
    };

    const submitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        if (!isAuthenticated) {
            alert('Please login to comment');
            return;
        }

        setSubmittingComment(true);
        try {
            const response = await videoAPI.addComment(video.uuid, { comment_text: newComment });
            const addedComment = response.data.data || response.data;
            setComments([addedComment, ...comments]);
            setNewComment('');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to post comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    const deleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            await videoAPI.deleteComment(video.uuid, commentId);
            setComments(comments.filter(c => c.id !== commentId));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete comment');
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num?.toString() || '0';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative w-full h-full bg-gray-900">
            {/* Video Element */}
            <video
                ref={videoRef}
                src={video.video_url}
                poster={video.thumbnail_url}
                loop
                playsInline
                muted={isMuted}
                onEnded={onVideoEnd}
                onClick={togglePlay}
                className="w-full h-full object-contain cursor-pointer"
            />

            {/* Play/Pause Overlay */}
            {!isPlaying && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 cursor-pointer"
                    onClick={togglePlay}
                >
                    <svg className="h-20 w-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            )}

            {/* Video Info Overlay (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                {/* Business Link */}
                {video.business && (
                    <Link
                        to={`/businesses/${video.business.uuid}`}
                        className="flex items-center mb-3"
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                            {video.business.logo ? (
                                <img
                                    src={video.business.logo}
                                    alt={video.business.name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-white font-semibold">
                                    {video.business.name?.charAt(0)}
                                </span>
                            )}
                        </div>
                        <span className="text-white font-semibold">{video.business.name}</span>
                    </Link>
                )}

                {/* Title & Description */}
                <h3 className="text-white font-semibold mb-1">{video.title}</h3>
                {video.description && (
                    <p className="text-white text-sm mb-2 line-clamp-2">{video.description}</p>
                )}

                {/* Hashtags */}
                {video.hashtags && video.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {video.hashtags.slice(0, 5).map((tag, idx) => (
                            <span key={idx} className="text-primary-400 text-sm">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Buttons (Right Side) */}
            <div className="absolute right-4 bottom-20 flex flex-col gap-6">
                {/* Like Button */}
                <button
                    onClick={handleLike}
                    className="flex flex-col items-center group"
                >
                    <div className="w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center group-hover:bg-opacity-70 transition-all">
                        <svg
                            className={`h-7 w-7 ${isLiked ? 'fill-red-600 text-red-600' : 'text-white'}`}
                            fill={isLiked ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <span className="text-white text-xs mt-1">{formatNumber(likeCount)}</span>
                </button>

                {/* Comment Button */}
                {showComments && (
                    <button
                        onClick={() => setShowCommentsPanel(!showCommentsPanel)}
                        className="flex flex-col items-center group"
                    >
                        <div className="w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center group-hover:bg-opacity-70 transition-all">
                            <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <span className="text-white text-xs mt-1">{formatNumber(video.comments_count || 0)}</span>
                    </button>
                )}

                {/* Share Button */}
                <button className="flex flex-col items-center group">
                    <div className="w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center group-hover:bg-opacity-70 transition-all">
                        <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </div>
                    <span className="text-white text-xs mt-1">{formatNumber(video.share_count || 0)}</span>
                </button>

                {/* Mute/Unmute Button */}
                <button
                    onClick={toggleMute}
                    className="flex flex-col items-center group"
                >
                    <div className="w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center group-hover:bg-opacity-70 transition-all">
                        {isMuted ? (
                            <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>
                        ) : (
                            <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                        )}
                    </div>
                </button>
            </div>

            {/* Comments Panel */}
            {showComments && showCommentsPanel && (
                <div className="absolute inset-0 bg-black bg-opacity-90 z-10 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        <h3 className="text-white font-semibold text-lg">Comments</h3>
                        <button
                            onClick={() => setShowCommentsPanel(false)}
                            className="text-white p-2"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Comments List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {loadingComments ? (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <p>No comments yet</p>
                                <p className="text-sm mt-2">Be the first to comment!</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center">
                                        <span className="text-white text-sm">
                                            {comment.user?.first_name?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-white font-medium text-sm">
                                                {comment.user?.first_name} {comment.user?.last_name}
                                            </span>
                                            <span className="text-gray-400 text-xs">
                                                {formatDate(comment.created_at)}
                                            </span>
                                            {comment.can_delete && (
                                                <button
                                                    onClick={() => deleteComment(comment.id)}
                                                    className="text-red-400 hover:text-red-300 transition ml-auto"
                                                    title="Delete comment"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-gray-200 text-sm">{comment.comment_text || comment.comment}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Comment Input */}
                    <form onSubmit={submitComment} className="p-4 border-t border-gray-700">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                disabled={submittingComment}
                                className="flex-1 px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-full focus:outline-none focus:border-primary-600 disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim() || submittingComment}
                                className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submittingComment ? '...' : 'Post'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
