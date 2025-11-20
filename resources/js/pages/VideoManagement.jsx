import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Container from '../components/Container';
import Button from '../components/Button';

const VideoManagement = () => {
    const { user, isAuthenticated } = useAuth();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        if (!isAuthenticated || user?.user_type !== 'business') {
            navigate('/');
            return;
        }
        fetchVideos();
    }, [isAuthenticated, user, navigate]);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const response = await api.get('/my-business/videos');
            console.log('Videos response:', response.data);
            setVideos(response.data.data || []);
        } catch (error) {
            console.error('Error fetching videos:', error);
            console.error('Error response:', error.response?.data);
            showError('Failed to load videos');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (videoUuid) => {
        if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
            return;
        }

        try {
            setDeletingId(videoUuid);
            await api.delete(`/videos/${videoUuid}`);
            setVideos(videos.filter(v => v.uuid !== videoUuid));
            showSuccess('Video deleted successfully');
        } catch (error) {
            console.error('Error deleting video:', error);
            showError(error.response?.data?.message || 'Failed to delete video');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatViews = (count) => {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        }
        return count;
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

    return (
        <Container>
            <div className="max-w-7xl mx-auto py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">My Videos</h1>
                        <p className="text-text-secondary mt-2">Manage your uploaded videos</p>
                    </div>
                    <div className="flex gap-4">
                        <Button onClick={() => navigate('/management')}>
                            ← Back to Dashboard
                        </Button>
                        <Button onClick={() => navigate('/videos/upload')}>
                            + Upload Video
                        </Button>
                    </div>
                </div>

                {videos.length === 0 ? (
                    <div className="bg-background rounded-lg shadow-md p-12 text-center">
                        <svg className="mx-auto h-16 w-16 text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <h2 className="text-xl font-semibold text-text-primary mb-2">No videos yet</h2>
                        <p className="text-text-secondary mb-6">Start sharing your work with the community</p>
                        <Button onClick={() => navigate('/videos/upload')}>
                            Upload Your First Video
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {videos.map((video) => (
                            <div key={video.id} className="bg-background rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                {/* Video Thumbnail */}
                                <div className="relative aspect-video bg-gray-200">
                                    {video.thumbnail_url ? (
                                        <img
                                            src={video.thumbnail_url}
                                            alt={video.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="h-16 w-16 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    )}
                                    {/* Status Badge */}
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                            video.status === 'published'
                                                ? 'bg-green-500 text-white'
                                                : video.status === 'processing'
                                                ? 'bg-yellow-500 text-white'
                                                : 'bg-gray-500 text-white'
                                        }`}>
                                            {video.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Video Info */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-text-primary mb-2 line-clamp-2">
                                        {video.title}
                                    </h3>
                                    {video.description && (
                                        <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                                            {video.description}
                                        </p>
                                    )}

                                    {/* Stats */}
                                    <div className="flex items-center text-xs text-text-secondary mb-4 space-x-4">
                                        <div className="flex items-center">
                                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            {formatViews(video.view_count || 0)} views
                                        </div>
                                        <div className="flex items-center">
                                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                            {formatViews(video.like_count || 0)} likes
                                        </div>
                                    </div>

                                    <div className="text-xs text-text-secondary mb-4">
                                        Uploaded {formatDate(video.created_at)}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/videos/${video.uuid}`)}
                                            className="flex-1 px-3 py-2 text-sm border border-border rounded-md hover:bg-surface text-text-primary"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleDelete(video.uuid)}
                                            disabled={deletingId === video.uuid}
                                            className="flex-1 px-3 py-2 text-sm bg-error text-white rounded-md hover:bg-error/80 disabled:opacity-50"
                                        >
                                            {deletingId === video.uuid ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Container>
    );
};

export default VideoManagement;
