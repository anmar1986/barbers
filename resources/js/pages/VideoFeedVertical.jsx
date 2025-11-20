import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { videoAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * TikTok-Style Vertical Video Feed
 * Full-screen, swipe-to-scroll video experience
 */
const VideoFeedVertical = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { showError, showSuccess } = useToast();

    const [videos, setVideos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [muted, setMuted] = useState(true);
    const [following, setFollowing] = useState({});

    const containerRef = useRef(null);
    const videoRefs = useRef([]);
    const observerRef = useRef(null);
    const lastTapRef = useRef(0);

    useEffect(() => {
        fetchVideos();
    }, []);

    useEffect(() => {
        setupIntersectionObserver();
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [videos]);

    useEffect(() => {
        // Handle keyboard navigation
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') scrollToNext();
            if (e.key === 'ArrowUp') scrollToPrevious();
            if (e.key === ' ') togglePlayPause();
            if (e.key === 'm' || e.key === 'M') setMuted(prev => !prev);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, videos]);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const response = await videoAPI.getFeed({ limit: 50 });
            const fetchedVideos = response.data.data || [];
            setVideos(fetchedVideos);

            // Preload first 3 videos
            fetchedVideos.slice(0, 3).forEach((video, index) => {
                const videoElement = videoRefs.current[index];
                if (videoElement) {
                    videoElement.load();
                }
            });
        } catch (error) {
            console.error('Error fetching videos:', error);
            showError('Failed to load videos');
        } finally {
            setLoading(false);
        }
    };

    const setupIntersectionObserver = () => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.75, // 75% visible to trigger
        };

        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const videoElement = entry.target.querySelector('video');
                if (!videoElement) return;

                if (entry.isIntersecting) {
                    // Play video when in view
                    videoElement.play().catch(err => console.log('Autoplay prevented:', err));

                    // Update current index
                    const index = parseInt(entry.target.dataset.index, 10);
                    setCurrentIndex(index);

                    // Preload next videos
                    preloadNextVideos(index);
                } else {
                    // Pause video when out of view
                    videoElement.pause();
                    videoElement.currentTime = 0;
                }
            });
        }, options);

        // Observe all video containers
        document.querySelectorAll('.video-container').forEach((container) => {
            observerRef.current.observe(container);
        });
    };

    const preloadNextVideos = (currentIdx) => {
        // Preload next 2 videos
        for (let i = currentIdx + 1; i <= Math.min(currentIdx + 2, videos.length - 1); i++) {
            const videoElement = videoRefs.current[i];
            if (videoElement && videoElement.readyState < 2) {
                videoElement.load();
            }
        }
    };

    const scrollToNext = () => {
        if (currentIndex < videos.length - 1) {
            const nextElement = document.querySelector(`[data-index="${currentIndex + 1}"]`);
            nextElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            // Fetch more videos
            fetchVideos();
        }
    };

    const scrollToPrevious = () => {
        if (currentIndex > 0) {
            const prevElement = document.querySelector(`[data-index="${currentIndex - 1}"]`);
            prevElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const togglePlayPause = () => {
        const currentVideo = videoRefs.current[currentIndex];
        if (currentVideo) {
            if (currentVideo.paused) {
                currentVideo.play();
            } else {
                currentVideo.pause();
            }
        }
    };

    const handleDoubleTap = (videoUuid, isLiked) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
            // Double tap detected - Like video
            if (!isLiked) {
                handleLike(videoUuid, false);
                showLikeAnimation();
            }
        }
        lastTapRef.current = now;
    };

    const showLikeAnimation = () => {
        // Create heart animation
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.className = 'like-animation';
        document.querySelector('.video-container.active')?.appendChild(heart);

        setTimeout(() => heart.remove(), 1000);
    };

    const handleLike = async (videoUuid, isLiked) => {
        if (!isAuthenticated) {
            showError('Please login to like videos');
            navigate('/login');
            return;
        }

        try {
            const response = isLiked
                ? await api.post(`/videos/${videoUuid}/unlike`)
                : await api.post(`/videos/${videoUuid}/like`);

            if (response.data.success && response.data.data) {
                setVideos(videos.map(v =>
                    v.uuid === videoUuid
                        ? { ...v, is_liked: response.data.data.is_liked, like_count: response.data.data.like_count }
                        : v
                ));
            }
        } catch (error) {
            console.error('Error liking video:', error);
            showError('Failed to update like');
        }
    };

    const handleFollow = async (businessId) => {
        if (!isAuthenticated) {
            showError('Please login to follow');
            navigate('/login');
            return;
        }

        try {
            const isFollowing = following[businessId];
            const response = isFollowing
                ? await api.delete(`/businesses/${businessId}/unfollow`)
                : await api.post(`/businesses/${businessId}/follow`);

            if (response.data.success) {
                setFollowing(prev => ({ ...prev, [businessId]: !isFollowing }));
                showSuccess(isFollowing ? 'Unfollowed' : 'Following!');
            }
        } catch (error) {
            console.error('Error following:', error);
            showError('Failed to update follow status');
        }
    };

    const handleComment = (videoUuid) => {
        navigate(`/videos/${videoUuid}`);
    };

    const handleShare = async (video) => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: video.title || 'Check out this video!',
                    text: video.description || '',
                    url: window.location.origin + `/videos/${video.uuid}`,
                });
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(window.location.origin + `/videos/${video.uuid}`);
                showSuccess('Link copied to clipboard!');
            }

            // Track share
            await api.post(`/videos/${video.uuid}/share`);
        } catch (error) {
            console.log('Share failed:', error);
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num || 0;
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (videos.length === 0) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
                <div className="text-center">
                    <p className="text-xl mb-4">No videos available</p>
                    <Link to="/" className="text-primary-400 hover:underline">Go to homepage</Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                .video-feed-vertical {
                    scroll-snap-type: y mandatory;
                    overflow-y: scroll;
                    height: 100vh;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none; /* Firefox */
                }
                .video-feed-vertical::-webkit-scrollbar {
                    display: none; /* Chrome, Safari */
                }
                .video-container {
                    scroll-snap-align: start;
                    scroll-snap-stop: always;
                    position: relative;
                    height: 100vh;
                    width: 100%;
                }
                .like-animation {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0);
                    font-size: 120px;
                    animation: likeScale 0.6s ease-out forwards;
                    pointer-events: none;
                    z-index: 100;
                }
                @keyframes likeScale {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
                }
            `}</style>

            <div className="video-feed-vertical fixed inset-0 bg-black" ref={containerRef}>
                {videos.map((video, index) => (
                    <div
                        key={video.id}
                        className={`video-container ${index === currentIndex ? 'active' : ''}`}
                        data-index={index}
                        onDoubleClick={() => handleDoubleTap(video.uuid, video.is_liked)}
                    >
                        {/* Video Player */}
                        <video
                            ref={el => videoRefs.current[index] = el}
                            src={video.video_url}
                            className="absolute inset-0 w-full h-full object-contain bg-black"
                            loop
                            playsInline
                            muted={muted}
                            preload={index < 3 ? 'auto' : 'metadata'}
                            onClick={togglePlayPause}
                        />

                        {/* Top Gradient Overlay */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent z-10" />

                        {/* Bottom Gradient Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent z-10" />

                        {/* Top Controls */}
                        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20">
                            <Link to="/" className="text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setMuted(!muted);
                                    }}
                                    className="text-white"
                                >
                                    {muted ? (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Bottom Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 pb-20 z-20">
                            {/* Business Info */}
                            {video.business && (
                                <Link to={`/businesses/${video.business.uuid}`} className="flex items-center gap-3 mb-4">
                                    <img
                                        src={video.business.logo || '/images/default-avatar.jpg'}
                                        alt={video.business.business_name}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-white font-semibold">{video.business.business_name}</h3>
                                            {video.business.is_verified && (
                                                <svg className="w-4 h-4 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <p className="text-white/80 text-sm">{video.business.business_type}</p>
                                    </div>
                                    {user?.id !== video.business.user_id && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleFollow(video.business.uuid);
                                            }}
                                            className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                                                following[video.business.uuid]
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-primary-600 text-white'
                                            }`}
                                        >
                                            {following[video.business.uuid] ? 'Following' : 'Follow'}
                                        </button>
                                    )}
                                </Link>
                            )}

                            {/* Video Title & Description */}
                            <div className="text-white mb-2">
                                <h2 className="font-semibold text-lg mb-1">{video.title}</h2>
                                {video.description && (
                                    <p className="text-sm text-white/90 line-clamp-2">{video.description}</p>
                                )}
                            </div>

                            {/* Hashtags */}
                            {video.hashtags && video.hashtags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {video.hashtags.map((tag, idx) => (
                                        <span key={idx} className="text-white/90 text-sm">
                                            #{tag.hashtag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Side Actions */}
                        <div className="absolute right-4 bottom-24 flex flex-col gap-6 z-20">
                            {/* Like */}
                            <button
                                onClick={() => handleLike(video.uuid, video.is_liked)}
                                className="flex flex-col items-center"
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                                    video.is_liked ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
                                }`}>
                                    <svg className={`w-7 h-7 ${video.is_liked ? 'text-white' : 'text-white'}`} fill={video.is_liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <span className="text-white text-xs mt-1 font-semibold">{formatNumber(video.like_count)}</span>
                            </button>

                            {/* Comment */}
                            <button
                                onClick={() => handleComment(video.uuid)}
                                className="flex flex-col items-center"
                            >
                                <div className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <span className="text-white text-xs mt-1 font-semibold">{formatNumber(video.comment_count)}</span>
                            </button>

                            {/* Share */}
                            <button
                                onClick={() => handleShare(video)}
                                className="flex flex-col items-center"
                            >
                                <div className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                </div>
                                <span className="text-white text-xs mt-1 font-semibold">{formatNumber(video.share_count)}</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default VideoFeedVertical;
