import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const NotificationBell = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/notifications/unread');
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const fetchRecentNotifications = async () => {
        if (loading) return;

        try {
            setLoading(true);
            const response = await api.get('/notifications/unread');
            setNotifications(response.data.notifications.slice(0, 5)); // Show only 5 most recent
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBellClick = () => {
        if (!showDropdown) {
            fetchRecentNotifications();
        }
        setShowDropdown(!showDropdown);
    };

    const handleMarkAsRead = async (notificationId, e) => {
        e.stopPropagation();
        try {
            await api.post(`/notifications/${notificationId}/read`);
            fetchUnreadCount();
            fetchRecentNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
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

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                onClick={handleBellClick}
                className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
                aria-label="Notifications"
            >
                <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>

                {/* Unread Count Badge */}
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <span className="text-xs text-gray-500">
                                {unreadCount} unread
                            </span>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="px-4 py-8 text-center text-gray-500">
                                Loading...
                            </div>
                        ) : notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                    onClick={() => {
                                        handleMarkAsRead(notification.id, {
                                            stopPropagation: () => {},
                                        });
                                        if (notification.data?.url) {
                                            navigate(notification.data.url);
                                            setShowDropdown(false);
                                        }
                                    }}
                                >
                                    <div className="flex gap-3">
                                        <span className="text-2xl shrink-0">
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 mb-1">
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-gray-600 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-gray-500">
                                                    {formatTimeAgo(notification.created_at)}
                                                </span>
                                                <button
                                                    onClick={(e) =>
                                                        handleMarkAsRead(notification.id, e)
                                                    }
                                                    className="text-xs text-primary-600 hover:text-primary-700"
                                                >
                                                    Mark as read
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-gray-500">
                                <div className="text-4xl mb-2">🔔</div>
                                <p className="text-sm">No new notifications</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-gray-200">
                        <Link
                            to="/notifications"
                            className="block text-center text-sm font-medium text-primary-600 hover:text-primary-700"
                            onClick={() => setShowDropdown(false)}
                        >
                            View all notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
