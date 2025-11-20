import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Container from '../../components/Container';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import api from '../../services/api';

const AdminVideos = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        perPage: 20,
    });

    useEffect(() => {
        if (!isAuthenticated || user?.user_type !== 'admin') {
            navigate('/');
            return;
        }
        fetchVideos();
    }, [isAuthenticated, user, navigate, pagination.currentPage]);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/videos', {
                params: {
                    page: pagination.currentPage,
                    per_page: pagination.perPage,
                },
            });

            setVideos(response.data.data);
            setPagination({
                currentPage: response.data.meta.current_page,
                totalPages: response.data.meta.last_page,
                perPage: response.data.meta.per_page,
            });
        } catch (error) {
            console.error('Error fetching videos:', error);
            toast.error('Failed to load videos');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (videoUuid, title) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) {
            return;
        }

        try {
            await api.delete(`/admin/videos/${videoUuid}`);
            toast.success('Video deleted successfully');
            fetchVideos();
        } catch (error) {
            toast.error('Failed to delete video');
        }
    };

    if (loading) {
        return (
            <Container>
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-xl text-gray-600">Loading...</div>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manage Videos</h1>
                        <p className="text-gray-600 mt-2">View and moderate all uploaded videos</p>
                    </div>
                    <Button onClick={() => navigate('/admin')}>← Back to Dashboard</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((video) => (
                        <Card key={video.uuid} padding="sm">
                            <div className="aspect-9/16 bg-gray-200 rounded-lg overflow-hidden mb-3">
                                <img
                                    src={video.thumbnail_url || '/placeholder-video.png'}
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                {video.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                                By: {video.business?.business_name}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                <span>👁️ {video.views_count || 0}</span>
                                <span>❤️ {video.likes_count || 0}</span>
                                <span>💬 {video.comments_count || 0}</span>
                            </div>
                            <div className="flex gap-2">
                                <Badge 
                                    color={video.status === 'published' ? 'green' : 'yellow'}
                                    size="sm"
                                >
                                    {video.status}
                                </Badge>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    fullWidth
                                    onClick={() => window.open(`/videos/${video.uuid}`, '_blank')}
                                >
                                    View
                                </Button>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    fullWidth
                                    onClick={() => handleDelete(video.uuid, video.title)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                {videos.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No videos found</p>
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="mt-8 flex justify-between items-center">
                        <Button
                            onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                            disabled={pagination.currentPage === 1}
                            variant="secondary"
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-gray-700">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </span>
                        <Button
                            onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                            disabled={pagination.currentPage === pagination.totalPages}
                            variant="secondary"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </Container>
    );
};

export default AdminVideos;
