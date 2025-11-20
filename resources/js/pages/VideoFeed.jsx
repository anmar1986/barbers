import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { videoAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Container from '../components/Container';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';

const VideoFeed = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { showError, showSuccess } = useToast();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'trending'
    const [playingVideoId, setPlayingVideoId] = useState(null);

    useEffect(() => {
        fetchVideos();
    }, [activeTab]);

    const fetchVideos = async () => {
        setLoading(true);
        try {
            const response = activeTab === 'feed'
                ? await videoAPI.getFeed({ limit: 20 })
                : await videoAPI.getTrending({ limit: 20 });

            const videos = response.data.data || [];
            setVideos(videos);
        } catch (error) {
            console.error('Error fetching videos:', error);
            showError('Failed to load videos');
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num;
    };

    const handleLike = async (videoUuid, isLiked) => {
        if (!isAuthenticated) {
            showError('Please login to like videos');
            return;
        }

        try {
            let response;
            if (isLiked) {
                response = await api.post(`/videos/${videoUuid}/unlike`);
            } else {
                response = await api.post(`/videos/${videoUuid}/like`);
            }

            // Update video in state using data from API response
            if (response.data.success && response.data.data) {
                setVideos(videos.map(v =>
                    v.uuid === videoUuid
                        ? { ...v, is_liked: response.data.data.is_liked, like_count: response.data.data.like_count }
                        : v
                ));
            }
        } catch (error) {
            console.error('Error liking video:', error);
            showError(error.response?.data?.message || 'Failed to update like');
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="mb-4 sm:mb-6 lg:mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Video Feed</h1>
                    <p className="mt-1 sm:mt-2 text-base sm:text-lg text-gray-600">
                        Watch tutorials from professional barbers and stylists
                    </p>
                </div>
                <Button to="/videos/vertical" variant="primary" className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    Vertical View
                </Button>
            </div>

                {/* Tabs */}
                <div className="mb-4 sm:mb-6 lg:mb-8 flex gap-2">
                    <Button
                        onClick={() => setActiveTab('feed')}
                        variant={activeTab === 'feed' ? 'primary' : 'outline'}
                    >
                        For You
                    </Button>
                    <Button
                        onClick={() => setActiveTab('trending')}
                        variant={activeTab === 'trending' ? 'primary' : 'outline'}
                    >
                        🔥 Trending
                    </Button>
                </div>

                {/* Video Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : videos.length === 0 ? (
                    <Card className="text-center py-12" padding="lg">
                        <p className="text-gray-500 text-lg">No videos found</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                        {videos.map((video) => {
                            const isPlaying = playingVideoId === video.id;

                            return (
                            <Card
                                key={video.id}
                                hover={!isPlaying}
                                className="overflow-hidden"
                            >
                                {/* Video Player / Thumbnail */}
                                <div
                                    className="relative aspect-9/16 bg-gray-900 cursor-pointer"
                                    onClick={() => setPlayingVideoId(isPlaying ? null : video.id)}
                                >
                                    {isPlaying && video.video_url ? (
                                        <video
                                            src={video.video_url}
                                            controls
                                            autoPlay
                                            loop
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <>
                                            {video.thumbnail_url ? (
                                                <img
                                                    src={video.thumbnail_url}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg className="w-20 h-20 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}

                                            {/* Play Icon Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition">
                                                <svg className="w-16 h-16 text-white opacity-0 group-hover:opacity-90 hover:opacity-90 transition" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </>
                                    )}
                                    
                                    {/* Duration Badge */}
                                    {video.duration && (
                                        <div className="absolute bottom-2 right-2">
                                            <Badge variant="dark" size="sm">
                                                {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                                            </Badge>
                                        </div>
                                    )}
                                    
                                    {/* View Count */}
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="dark" size="sm">
                                            👁 {formatNumber(video.view_count)}
                                        </Badge>
                                    </div>
                                </div>
                                
                                {/* Video Info */}
                                <div className="p-3 sm:p-4">
                                    <h3 className="text-sm sm:text-base text-gray-900 font-semibold line-clamp-2 mb-2">
                                        {video.title}
                                    </h3>
                                    
                                    {/* Business Info */}
                                    {video.business && (
                                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                            {video.business.logo ? (
                                                <img 
                                                    src={video.business.logo} 
                                                    alt={video.business.business_name}
                                                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-semibold">
                                                    {video.business.business_name.charAt(0)}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm text-gray-600 truncate">
                                                    {video.business.business_name}
                                                </p>
                                            </div>
                                            {video.business.is_verified && (
                                                <svg className="w-4 h-4 text-primary-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Hashtags */}
                                    {video.hashtags && video.hashtags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                                            {video.hashtags.slice(0, 3).map((tag, idx) => (
                                                <span key={idx} className="text-xs text-primary-600">
                                                    #{tag.hashtag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Stats */}
                                    <div className="flex items-center gap-2 sm:gap-4 text-xs">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLike(video.uuid, video.is_liked);
                                            }}
                                            className={`flex items-center gap-1 ${video.is_liked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 transition`}
                                        >
                                            {video.is_liked ? '❤️' : '🤍'} {formatNumber(video.like_count)}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/videos/${video.uuid}`);
                                            }}
                                            className="flex items-center gap-1 text-gray-500 hover:text-primary-600 transition"
                                        >
                                            💬 {formatNumber(video.comment_count)}
                                        </button>
                                        <span className="flex items-center gap-1 text-gray-500">
                                            🔄 {formatNumber(video.share_count)}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                            );
                        })}
                    </div>
                )}
        </div>
    );
};

export default VideoFeed;
