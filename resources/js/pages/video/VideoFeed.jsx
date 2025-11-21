import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { videoAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import VideoPlayer from '../../components/VideoPlayer';

const VideoFeed = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('feed'); // 'feed' or 'trending'
    const [selectedVideo, setSelectedVideo] = useState(null);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        loadVideos();
    }, [filter]);

    const loadVideos = async () => {
        setLoading(true);
        const result = filter === 'trending'
            ? await videoAPI.getTrending()
            : await videoAPI.getFeed();

        if (result.success) {
            setVideos(result.data);
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    const handleLike = async (videoUuid, isLiked) => {
        if (!isAuthenticated) {
            alert('Please login to like videos');
            return;
        }

        try {
            const result = isLiked
                ? await videoAPI.unlike(videoUuid)
                : await videoAPI.like(videoUuid);

            if (result.data && result.data.success && result.data.data) {
                setVideos(videos.map(v =>
                    v.uuid === videoUuid
                        ? { ...v, is_liked: result.data.data.is_liked, like_count: result.data.data.like_count }
                        : v
                ));
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num?.toString() || '0';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Video Feed</h1>
                <p className="mt-2 text-gray-600">Discover amazing barber and beauty content</p>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 flex gap-4 border-b border-gray-200">
                <button
                    onClick={() => setFilter('feed')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                        filter === 'feed'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    For You
                </button>
                <button
                    onClick={() => setFilter('trending')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                        filter === 'trending'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Trending
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="mt-2 text-gray-600">Loading videos...</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {/* Video Grid */}
            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-600">No videos found</p>
                        </div>
                    ) : (
                        videos.map((video) => (
                            <div
                                key={video.uuid}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                {/* Video Thumbnail */}
                                <div
                                    className="relative aspect-video bg-gray-900 group cursor-pointer"
                                    onClick={() => setSelectedVideo(video)}
                                >
                                    {video.thumbnail_url ? (
                                        <img
                                            src={video.thumbnail_url}
                                            alt={video.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="h-16 w-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    {/* Play Button Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                                        <svg className="h-16 w-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                    {/* Duration Badge */}
                                    {video.duration && (
                                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                                            {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                                        </div>
                                    )}
                                </div>

                                {/* Video Info */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{video.title}</h3>

                                    {/* Business Link */}
                                    {video.business && (
                                        <Link
                                            to={`/businesses/${video.business.uuid}`}
                                            className="text-sm text-gray-600 hover:text-primary-600 mb-2 block"
                                        >
                                            {video.business.name}
                                        </Link>
                                    )}

                                    {/* Hashtags */}
                                    {video.hashtags && video.hashtags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {video.hashtags.slice(0, 3).map((tag, index) => (
                                                <span key={index} className="text-xs text-primary-600">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        {/* Likes */}
                                        <button
                                            onClick={() => handleLike(video.uuid, video.is_liked)}
                                            className="flex items-center gap-1 hover:text-red-600 transition-colors"
                                        >
                                            <svg
                                                className={`h-5 w-5 ${video.is_liked ? 'fill-red-600 text-red-600' : ''}`}
                                                fill={video.is_liked ? 'currentColor' : 'none'}
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                            <span>{formatNumber(video.likes_count || 0)}</span>
                                        </button>

                                        {/* Comments */}
                                        <div className="flex items-center gap-1">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <span>{formatNumber(video.comments_count || 0)}</span>
                                        </div>

                                        {/* Views */}
                                        <div className="flex items-center gap-1">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            <span>{formatNumber(video.views_count || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Video Player Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 z-50 bg-black">
                    {/* Close Button */}
                    <button
                        onClick={() => setSelectedVideo(null)}
                        className="absolute top-4 left-4 z-10 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Video Player */}
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-full max-w-lg h-full md:h-auto md:aspect-video">
                            <VideoPlayer
                                video={selectedVideo}
                                autoPlay={true}
                                showComments={true}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoFeed;
