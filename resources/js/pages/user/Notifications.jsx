import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Container from '../../components/Container';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import api from '../../services/api';

const Notifications = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchNotifications();
        fetchUnreadCount();
    }, [isAuthenticated, navigate, pagination.currentPage]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications', {
                params: { page: pagination.currentPage },
            });

            setNotifications(response.data.data);
            setPagination({
                currentPage: response.data.meta.current_page,
                totalPages: response.data.meta.last_page,
            });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/notifications/unread');
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await api.post(`/notifications/${notificationId}/read`);
            toast.success('Notification marked as read');
            fetchNotifications();
            fetchUnreadCount();
        } catch (error) {
            toast.error('Failed to mark notification as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.post('/notifications/read-all');
            toast.success('All notifications marked as read');
            fetchNotifications();
            fetchUnreadCount();
        } catch (error) {
            toast.error('Failed to mark all notifications as read');
        }
    };

    const handleDelete = async (notificationId) => {
        if (!confirm('Are you sure you want to delete this notification?')) {
            return;
        }

        try {
            await api.delete(`/notifications/${notificationId}`);
            toast.success('Notification deleted');
            fetchNotifications();
            fetchUnreadCount();
        } catch (error) {
            toast.error('Failed to delete notification');
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm('Are you sure you want to delete all notifications?')) {
            return;
        }

        try {
            await api.delete('/notifications');
            toast.success('All notifications deleted');
            fetchNotifications();
            setUnreadCount(0);
        } catch (error) {
            toast.error('Failed to delete all notifications');
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            info: '🔔',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            message: '💬',
            like: '❤️',
            comment: '💬',
            follow: '👤',
            order: '🛒',
            payment: '💳',
        };
        return icons[type] || '🔔';
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60,
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }

        return 'Just now';
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
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
                        <p className="text-gray-600">
                            {unreadCount > 0
                                ? `You have ${unreadCount} unread notification${
                                      unreadCount > 1 ? 's' : ''
                                  }`
                                : 'All caught up!'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <Button size="sm" variant="secondary" onClick={handleMarkAllAsRead}>
                                Mark All Read
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button size="sm" variant="danger" onClick={handleDeleteAll}>
                                Delete All
                            </Button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                {notifications.length > 0 ? (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <Card
                                key={notification.id}
                                padding="sm"
                                className={`${
                                    !notification.is_read
                                        ? 'bg-blue-50 border-l-4 border-l-primary-600'
                                        : ''
                                }`}
                            >
                                <div className="flex gap-4">
                                    {/* Icon */}
                                    <div className="text-3xl shrink-0">
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-1">
                                            <h3 className="font-semibold text-gray-900">
                                                {notification.title}
                                            </h3>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {!notification.is_read && (
                                                    <Badge color="blue" size="sm">
                                                        New
                                                    </Badge>
                                                )}
                                                <span className="text-xs text-gray-500">
                                                    {formatTimeAgo(notification.created_at)}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 text-sm mb-3">
                                            {notification.message}
                                        </p>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            {!notification.is_read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(notification.id)}
                                                className="text-xs text-red-600 hover:text-red-700 font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔔</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No notifications
                        </h3>
                        <p className="text-gray-600 mb-6">
                            You're all caught up! Check back later for updates.
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="mt-8 flex justify-between items-center">
                        <Button
                            onClick={() =>
                                setPagination({
                                    ...pagination,
                                    currentPage: pagination.currentPage - 1,
                                })
                            }
                            disabled={pagination.currentPage === 1}
                            variant="secondary"
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-gray-700">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </span>
                        <Button
                            onClick={() =>
                                setPagination({
                                    ...pagination,
                                    currentPage: pagination.currentPage + 1,
                                })
                            }
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

export default Notifications;
